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

  const score = (f, s) => s.commits * 3 + s.linesChanged / 10 + (f === bossFile ? 20 : 0);
  const [mvpPath, mvp] = Object.entries(files).sort((a, b) => score(...b) - score(...a))[0] ?? [];

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
