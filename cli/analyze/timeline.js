export const MIN = 60_000;

export const byTime = (events) => [...events].sort((a, b) => a.ts - b.ts);

// Split a sorted timeline wherever the gap exceeds gapMin; return the most recent session
// that has a commit (a session you only just started has nothing to recap yet).
export function lastSession(events, gapMin) {
  const sessions = [];
  let start = 0;
  for (let i = 1; i <= events.length; i++) {
    if (i === events.length || events[i].ts - events[i - 1].ts > gapMin * MIN) {
      sessions.push(events.slice(start, i));
      start = i;
    }
  }
  return sessions.findLast((s) => s.some((e) => e.type === 'commit')) ?? sessions.at(-1) ?? [];
}

// Minutes actually worked: pauses longer than breakMin (sleep, lunch) don't count.
export function activeMin(events, breakMin) {
  let ms = 0;
  for (let i = 1; i < events.length; i++) {
    const d = events[i].ts - events[i - 1].ts;
    if (d <= breakMin * MIN) ms += d;
  }
  return Math.round(ms / MIN);
}
