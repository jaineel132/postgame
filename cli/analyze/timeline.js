export const MIN = 60_000;

export const byTime = (events) => [...events].sort((a, b) => a.ts - b.ts);

// Split a sorted timeline wherever the gap exceeds gapMin; return the most recent session.
export function lastSession(events, gapMin) {
  let start = 0;
  for (let i = 1; i < events.length; i++) {
    if (events[i].ts - events[i - 1].ts > gapMin * MIN) start = i;
  }
  return events.slice(start);
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
