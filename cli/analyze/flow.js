import { MIN } from './timeline.js';

// Longest run where every event is under 3 minutes after the previous one.
export function longestFlow(events) {
  let best = 0, start = 0;
  for (let i = 1; i < events.length; i++) {
    if (events[i].ts - events[i - 1].ts >= 3 * MIN) start = i;
    else best = Math.max(best, events[i].ts - events[start].ts);
  }
  return Math.round(best / MIN);
}
