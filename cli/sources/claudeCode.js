import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

// Format notes: architecture.md §3.2. Every failure here degrades to "no Claude data", never a crash.

const SHELL = new Set(['Bash', 'PowerShell']);
const EDIT = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

const norm = (p) => path.resolve(p).replace(/\\/g, '/').toLowerCase();

function jsonlFiles(dir, depth = 0, out = []) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && depth < 3) jsonlFiles(p, depth + 1, out);
    else if (e.isFile() && e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}

const text = (content) =>
  typeof content === 'string' ? content
    : Array.isArray(content) ? content.map((c) => c?.text ?? '').join('') : '';

function isPrompt(o) {
  if (o.isSidechain || o.isMeta || o.isCompactSummary) return false;
  if (o.promptSource) return o.promptSource !== 'system';
  const c = o.message?.content;
  if (Array.isArray(c) && c.some((x) => x?.type === 'tool_result')) return false;
  const t = text(c).trimStart();
  return t.length > 0 && !/^(<command-|<local-command|\[Request interrupted)/.test(t);
}

function patchLines(result, input) {
  const hunks = result?.structuredPatch;
  if (Array.isArray(hunks) && hunks.length) {
    let added = 0, removed = 0;
    for (const h of hunks) for (const l of h.lines ?? []) {
      if (l.startsWith('+')) added++;
      else if (l.startsWith('-')) removed++;
    }
    return { added, removed };
  }
  const content = input?.content ?? result?.content; // Write creating a new file
  return { added: typeof content === 'string' ? content.split('\n').length : 0, removed: 0 };
}

export async function readClaude(root, { from, to }) {
  const base = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'projects');
  const encoded = path.join(base, root.replace(/[^A-Za-z0-9]/g, '-'));
  const files = jsonlFiles(fs.existsSync(encoded) ? encoded : base) // fallback: scan all, filter by cwd
    .filter((f) => { try { return fs.statSync(f).mtime >= from; } catch { return false; } });

  const r = norm(root);
  const inRepo = (cwd) => {
    if (!cwd) return false;
    const c = norm(cwd);
    return c === r || c.startsWith(r + '/') || r.startsWith(c + '/');
  };
  const rel = (p) => path.relative(root, p).replace(/\\/g, '/');

  const seen = new Set();
  const calls = new Map(); // tool_use id → { name, input }
  const replies = new Map(); // message.id → { ts, tokens }
  const models = {};
  const subagentFiles = new Set();
  const events = [];
  const ai = { interrupts: 0, claudeLinesAdded: {}, busyMs: 0, compactions: 0, missedEdits: 0, rejected: 0 };

  for (const file of files) {
    const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
    for await (const line of rl) {
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      if (!o?.timestamp || !inRepo(o.cwd)) continue;
      const ts = new Date(o.timestamp);
      if (!(ts >= from && ts <= to)) continue;
      if (o.uuid) { if (seen.has(o.uuid)) continue; seen.add(o.uuid); } // resumed sessions repeat lines
      if (o.isSidechain) subagentFiles.add(file);

      if (o.type === 'assistant') {
        const m = o.message ?? {};
        const id = m.id ?? o.uuid;
        const prev = replies.get(id);
        replies.set(id, { ts: prev?.ts ?? ts, tokens: Math.max(prev?.tokens ?? 0, m.usage?.output_tokens ?? 0) });
        if (!prev && m.model && !m.model.startsWith('<')) models[m.model] = (models[m.model] || 0) + 1;
        for (const c of Array.isArray(m.content) ? m.content : []) {
          if (c?.type === 'tool_use') calls.set(c.id, { name: c.name, input: c.input ?? {} });
        }
      } else if (o.type === 'user') {
        const content = o.message?.content;
        const t = text(content);
        if (t.startsWith('[Request interrupted by user')) { ai.interrupts++; continue; }
        if (o.isCompactSummary) continue; // counted via its compact_boundary line
        if (isPrompt(o)) { events.push({ ts, type: 'prompt', files: [], lines: 0, message: '', failed: false }); continue; }

        for (const c of Array.isArray(content) ? content : []) {
          if (c?.type !== 'tool_result') continue;
          const call = calls.get(c.tool_use_id);
          if (!call) continue;
          const out = text(c.content);
          if (out.startsWith("The user doesn't want to proceed")) { ai.rejected++; continue; }
          if (SHELL.has(call.name)) {
            const failed = c.is_error === true && /^Exit code \d+/.test(out);
            events.push({ ts, type: 'command', files: [], lines: 0, message: String(call.input.command ?? '').slice(0, 200), failed });
          } else if (EDIT.has(call.name)) {
            if (c.is_error) { if (out.includes('String to replace not found')) ai.missedEdits++; continue; }
            const fp = o.toolUseResult?.filePath ?? call.input.file_path ?? call.input.notebook_path;
            if (!fp) continue;
            const f = rel(fp);
            const { added, removed } = patchLines(o.toolUseResult, call.input);
            ai.claudeLinesAdded[f] = (ai.claudeLinesAdded[f] || 0) + added;
            events.push({ ts, type: 'edit', files: [f], lines: added + removed, message: '', failed: false });
          }
        }
      } else if (o.type === 'system') {
        if (o.subtype === 'turn_duration') ai.busyMs += o.durationMs ?? 0;
        else if (o.subtype === 'compact_boundary') ai.compactions++;
      }
    }
  }

  for (const { ts } of replies.values()) events.push({ ts, type: 'reply', files: [], lines: 0, message: '', failed: false });
  if (!events.length) return null;

  ai.turns = replies.size;
  ai.tokensOut = [...replies.values()].reduce((s, x) => s + x.tokens, 0);
  ai.subagents = subagentFiles.size;
  ai.model = Object.entries(models).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { events, ai };
}
