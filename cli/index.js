#!/usr/bin/env node
import path from 'node:path';
import { parseArgs } from 'node:util';
import { gitRoot, readGit } from './sources/git.js';
import { readClaude } from './sources/claudeCode.js';
import { byTime, lastSession } from './analyze/timeline.js';

const HOUR = 3_600_000;
const die = (msg) => { console.error(`postgame: ${msg}`); process.exit(1); };

let values;
try {
  ({ values } = parseArgs({
    options: {
      last: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  }));
} catch (e) { die(e.message); }

const root = gitRoot(process.cwd());
if (!root) die('not a git repository — run this inside your project folder.');

// Fixed window (--last / --from) or a 30-day lookback that we split into sessions.
const now = new Date();
const fixed = Boolean(values.last || values.from);
const from = values.from ? new Date(values.from)
  : new Date(now - (values.last ? Number(values.last) : 24 * 30) * HOUR);
const to = values.to ? new Date(values.to) : now;
if (isNaN(from) || isNaN(to) || from >= to) die('bad time window — check --last / --from / --to.');

const safeClaude = (win) => readClaude(root, win).catch(() => null);

const commits = readGit(root, { from, to });
let claude = await safeClaude({ from, to });
let session = byTime([...commits, ...(claude?.events ?? [])]);
if (!fixed) {
  session = lastSession(session, claude ? 30 : 120);
  // Re-read Claude over just this session so the ai extras cover the same stretch.
  if (claude && session.length) {
    claude = await safeClaude({ from: session[0].ts, to: session.at(-1).ts });
    const sessionCommits = session.filter((e) => e.type === 'commit');
    session = byTime([...sessionCommits, ...(claude?.events ?? [])]);
  }
}

const sc = session.filter((e) => e.type === 'commit');
if (!sc.length) die(fixed ? 'no commits in that window.' : 'no session found — try --last 12, or --from <date> --to <date>.');

// ---- raw stats (stage 4 heuristics come next) ----
const start = session[0].ts, end = session.at(-1).ts;
const count = (type, pred = () => true) => session.filter((e) => e.type === type && pred(e)).length;
const churn = {};
for (const c of sc) for (const f of c.files) churn[f] = (churn[f] || 0) + c.fileLines[f];
const gaps = sc.map((c, i) => Math.round((c.ts - (i ? sc[i - 1].ts : start)) / 60_000));
const fmt = (d) => d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

const out = {
  repo: path.basename(root),
  window: `${fmt(start)} → ${fmt(end)}`,
  durationMin: Math.round((end - start) / 60_000),
  commits: sc.length,
  commitGapsMin: gaps,
  filesTouched: Object.keys(churn).length,
  linesChanged: sc.reduce((s, c) => s + c.lines, 0),
  topFiles: Object.entries(churn).sort((a, b) => b[1] - a[1]).slice(0, 5),
};
if (claude) {
  Object.assign(out, {
    prompts: count('prompt'),
    turns: claude.ai.turns,
    commands: count('command'),
    failedCommands: count('command', (e) => e.failed),
    edits: count('edit'),
    interrupts: claude.ai.interrupts,
    missedEdits: claude.ai.missedEdits,
    rejectedTools: claude.ai.rejected,
    busyMin: Math.round(claude.ai.busyMs / 60_000),
    tokensOut: claude.ai.tokensOut,
    compactions: claude.ai.compactions,
    subagents: claude.ai.subagents,
    model: claude.ai.model,
  });
} else out.claude = 'no Claude Code logs for this repo/window';

console.log(out);
