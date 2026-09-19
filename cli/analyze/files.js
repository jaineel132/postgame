// Docs and notes never become the boss-fight or MVP file — unless the session touched nothing else.
export const isDoc = (f) => /\.(md|mdx|markdown|txt|rst|adoc)$/i.test(f);

// Highest-scoring file; ties go to the higher tiebreak value.
export function pickFile(scores, tiebreak = {}) {
  const all = Object.entries(scores);
  const code = all.filter(([f]) => !isDoc(f));
  const ranked = (code.length ? code : all).sort((a, b) => b[1] - a[1] || (tiebreak[b[0]] ?? 0) - (tiebreak[a[0]] ?? 0));
  return ranked[0]?.[0] ?? null;
}

// Churn per file, the MVP file, and how much of the committed code Claude wrote.
export function fileStats(commits, bossFile, claudeLinesAdded) {
  const files = {};
  for (const c of commits) {
    for (const f of c.files) {
      const s = (files[f] ??= { commits: 0, linesChanged: 0, added: 0 });
      s.commits++;
      s.linesChanged += c.fileLines[f];
      s.added += c.fileAdded[f];
    }
  }

  const scores = {};
  for (const [f, s] of Object.entries(files)) scores[f] = s.commits * 3 + s.linesChanged / 10 + (f === bossFile ? 20 : 0);
  const mvpPath = pickFile(scores);
  const mvp = files[mvpPath];

  // Per file, Claude can't have written more than was committed — so the total stays ≤ 100%.
  let claudeLinesPct = null;
  const gitAdded = Object.values(files).reduce((n, s) => n + s.added, 0);
  if (claudeLinesAdded && gitAdded) {
    const byClaude = Object.entries(files).reduce((n, [f, s]) => n + Math.min(claudeLinesAdded[f] ?? 0, s.added), 0);
    claudeLinesPct = Math.round((byClaude / gitAdded) * 100);
  }

  return {
    filesTouched: Object.keys(files).length,
    linesChanged: Object.values(files).reduce((n, s) => n + s.linesChanged, 0),
    mvpFile: mvpPath ? { path: mvpPath, commits: mvp.commits, linesChanged: mvp.linesChanged } : null,
    claudeLinesPct,
  };
}
