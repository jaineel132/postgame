// The frozen v1 payload — architecture.md §5. The CLI builds it; the card only renders it.
export type Recap = {
  v: 1;
  repo: string;
  startedAt: string; // ISO with the user's own offset, e.g. 2026-09-19T14:07:00+05:30
  endedAt: string;
  durationMin: number;
  archetype: { title: string; subtitle: string };
  stats: {
    commits: number;
    filesTouched: number;
    linesChanged: number;
    longestFlowMin: number | null;
    failedCommands: number | null;
  };
  bossFight: { minutes: number; file: string | null; endedBy: string; failedCommands: number | null } | null;
  streak: { commits: number; withinMin: number } | null;
  mvpFile: { path: string; commits: number; linesChanged: number } | null;
  ai: { available: false } | Ai;
};

export type Ai = {
  available: true;
  source: string;
  model: string | null;
  prompts: number;
  turns: number;
  promptsPerCommit: number | null;
  interrupts: number;
  claudeLinesPct: number | null;
  busyMin: number;
  tokensOut: number;
  compactions: number;
  subagents: number;
  missedEdits: number;
};
