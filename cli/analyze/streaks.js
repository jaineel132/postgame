import { MIN } from './timeline.js';

// Best run of 3+ commits, each within 15 min of the last, with no failed command in between.
export function bestStreak(events) {
  let best = null, run = [], failedSince = false;
  for (const e of events) {
    if (e.type === 'command' && e.failed) failedSince = true;
    if (e.type !== 'commit') continue;
    const ok = run.length && e.ts - run.at(-1).ts <= 15 * MIN && !failedSince;
    run = ok ? [...run, e] : [e];
    failedSince = false;
    if (run.length >= 3 && run.length > (best?.commits ?? 0)) {
      best = { commits: run.length, withinMin: Math.round((run.at(-1).ts - run[0].ts) / MIN) };
    }
  }
  return best;
}
