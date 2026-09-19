const MIN = 60_000;

export const byTime = (events) => [...events].sort((a, b) => a.ts - b.ts);

// Split a sorted timeline wherever the gap exceeds gapMin; return the most recent session.
export function lastSession(events, gapMin) {
  let start = 0;
  for (let i = 1; i < events.length; i++) {
    if (events[i].ts - events[i - 1].ts > gapMin * MIN) start = i;
  }
  return events.slice(start);
}
