import { execFileSync } from 'node:child_process';
import path from 'node:path';

const git = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });

export function gitRoot(cwd) {
  try {
    return path.resolve(git(cwd, ['rev-parse', '--show-toplevel']).trim());
  } catch {
    return null;
  }
}

const LOCKFILE = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|Cargo\.lock|poetry\.lock|uv\.lock|composer\.lock|Gemfile\.lock|go\.sum)$/;

// "src/{old => new}/a.js" and "old.js => new.js" → the new path
const renamed = (p) => p.replace(/\{[^{}]* => ([^{}]*)\}/g, '$1').replace(/^.* => /, '').replace(/\/\/+/g, '/');

// Own, non-merge commits in [from, to] → commit events, oldest first.
export function readGit(root, { from, to }) {
  let email = '';
  try { email = git(root, ['config', 'user.email']).trim(); } catch {}

  const args = ['log', '--no-merges', '--numstat', '--pretty=format:%x1e%H%n%cI%n%s',
    `--since=${from.toISOString()}`, `--until=${to.toISOString()}`];

  let out;
  try {
    // Only your commits (team repos) — unless that finds none, e.g. you committed under another email.
    out = email ? git(root, [...args, '--fixed-strings', `--author=${email}`]) : '';
    if (!out.trim()) out = git(root, args);
  } catch { return []; } // empty repo: no HEAD yet

  const events = [];
  for (const chunk of out.split('\x1e')) {
    const [hash, date, message = '', ...rest] = chunk.split('\n');
    if (!hash) continue;
    const files = [];
    const fileLines = {}; // added + removed, for churn
    const fileAdded = {}; // added only, for Claude-written %
    let lines = 0;
    for (const row of rest) {
      const [a, d, p] = row.split('\t');
      if (!p || a === '-') continue; // blank line or binary file
      const f = renamed(p);
      if (LOCKFILE.test(f)) continue; // generated, would always win MVP
      files.push(f);
      fileLines[f] = (fileLines[f] || 0) + Number(a) + Number(d);
      fileAdded[f] = (fileAdded[f] || 0) + Number(a);
      lines += Number(a) + Number(d);
    }
    events.push({ ts: new Date(date), type: 'commit', files, fileLines, fileAdded, lines, message, failed: false, hash });
  }
  return events.reverse();
}
