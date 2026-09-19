#!/usr/bin/env node
import path from 'node:path';
import { parseArgs } from 'node:util';
import { gitRoot, readGit } from './sources/git.js';
import { readClaude } from './sources/claudeCode.js';
import { byTime, lastSession, activeMin } from './analyze/timeline.js';
import { longestFlow } from './analyze/flow.js';
import { bossFight } from './analyze/bossFight.js';
import { bestStreak } from './analyze/streaks.js';
import { fileStats } from './analyze/files.js';
import { archetype } from './analyze/archetype.js';
import { upload } from './upload.js';

const HOUR = 3_600_000;
const die = (msg) => { console.error(`postgame: ${msg}`); process.exit(1); };

let values;
try {
  ({ values } = parseArgs({
    options: {
      last: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      name: { type: 'string' },
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
const name = values.name?.trim() || path.basename(root); // --name: the project's real name when the folder is a shortcut
if (name.length > 40) die('--name is too long (40 characters max).');

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

// ---- stage 4: derive ----
const ai = claude?.ai;
const breakMin = claude ? 30 : 120;
const count = (type, pred = () => true) => session.filter((e) => e.type === type && pred(e)).length;
const boss = bossFight(session, breakMin, Boolean(claude));
const files = fileStats(sc, boss?.file, ai?.claudeLinesAdded);
const prompts = count('prompt');

const stats = {
  durationMin: activeMin(session, breakMin),
  commits: sc.length,
  filesTouched: files.filesTouched,
  linesChanged: files.linesChanged,
  longestFlowMin: claude ? longestFlow(session) : null,
  failedCommands: claude ? count('command', (e) => e.failed) : null,
};

// ---- stage 5: archetype ----
const promptsPerCommit = claude ? Math.round((prompts / sc.length) * 10) / 10 : null;
const title = archetype({
  ...stats, bossFight: boss, promptsPerCommit,
  claudeLinesPct: files.claudeLinesPct, interrupts: ai?.interrupts ?? null,
});

// "2026-09-19T14:07:00+05:30" — keeps the user's own clock, so the card shows the right date.
const localIso = (d) => {
  const off = -d.getTimezoneOffset();
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const local = new Date(d.getTime() + off * 60_000).toISOString().slice(0, 19);
  return `${local}${off >= 0 ? '+' : '-'}${pad(off / 60)}:${pad(off % 60)}`;
};

// ---- stage 6: payload (architecture.md §5 — frozen after hour 7) ----
const payload = {
  v: 1,
  repo: name,
  startedAt: localIso(session[0].ts),
  endedAt: localIso(session.at(-1).ts),
  durationMin: stats.durationMin,
  archetype: title,
  stats: { commits: stats.commits, filesTouched: stats.filesTouched, linesChanged: stats.linesChanged,
           longestFlowMin: stats.longestFlowMin, failedCommands: stats.failedCommands },
  bossFight: boss,
  streak: bestStreak(session),
  mvpFile: files.mvpFile,
  ai: claude ? {
    available: true, source: 'claude-code', model: ai.model,
    prompts, turns: ai.turns, promptsPerCommit,
    interrupts: ai.interrupts, claudeLinesPct: files.claudeLinesPct,
    busyMin: Math.round(ai.busyMs / 60_000), tokensOut: ai.tokensOut,
    compactions: ai.compactions, subagents: ai.subagents, missedEdits: ai.missedEdits,
  } : { available: false },
};

console.log(`\n  ${title.title}\n  ${title.subtitle}\n`);

if (values['dry-run']) {
  console.log('Dry run — this is exactly what would be uploaded (numbers and names only, no code or prompts):\n');
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

try {
  console.log(`  Your recap → ${await upload(payload)}\n`);
} catch (e) {
  console.error(`postgame: upload failed (${e.message}). Here is your recap data so nothing is lost:\n`);
  console.log(JSON.stringify(payload, null, 2));
  process.exit(1);
}
