// Title + subtitle — first match wins, in prd.md §7 order.
// A rule that needs a missing value (git-only: null) never matches.

const has = (v) => v !== null && v !== undefined;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const base = (p) => p?.split('/').pop();
export const duration = (min) => (min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`);

export function archetype(s) {
  const boss = s.bossFight?.minutes ?? 0;
  const rules = [
    ['The Boss Fight', boss > 40, () =>
      `${boss} minutes on ${base(s.bossFight.file) ?? 'one fight'}` +
      (s.bossFight.failedCommands ? `, ${plural(s.bossFight.failedCommands, 'fail')}` : '') + ', and it blinked first.'],
    ['Death by a Thousand Cuts', has(s.failedCommands) && s.failedCommands > 12 && boss < 20, () =>
      `${s.failedCommands} failures, none of them interesting.`],
    ['Clean Sweep', s.commits >= 4 && (!has(s.failedCommands) || s.failedCommands <= 2), () =>
      `${s.commits} commits in ${duration(s.durationMin)}. Suspiciously smooth.`],
    ['Autopilot', has(s.claudeLinesPct) && s.claudeLinesPct > 80 && s.interrupts <= 1, () =>
      `Claude wrote ${s.claudeLinesPct}% of it. You kept the wheel.`],
    ['Backseat Driver', has(s.interrupts) && s.interrupts >= 6, () =>
      `You hit stop ${s.interrupts} times. Trust issues, vindicated.`],
    ['Deep Work', has(s.longestFlowMin) && s.longestFlowMin > 25, () =>
      `${s.longestFlowMin} straight minutes. Nobody messaged you. Miracle.`],
    ['The Scattergun', s.filesTouched > 12 && s.commits <= 2, () =>
      `${s.filesTouched} files touched, ${plural(s.commits, 'commit')} landed. Ambitious.`],
    ['Vibe Coded', has(s.promptsPerCommit) && s.promptsPerCommit > 8, () =>
      `${s.promptsPerCommit} prompts per commit. Vibes: immaculate.`],
    ['The Grind', true, () =>
      `${s.durationMin ? `${duration(s.durationMin)}, ` : ''}${plural(s.commits, 'commit')}. No highlights, all footage.`],
  ];
  const [title, , subtitle] = rules.find(([, match]) => match);
  return { title, subtitle: subtitle() };
}