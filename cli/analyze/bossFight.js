import { activeMin } from './timeline.js';
import { pickFile } from './files.js';

// Chunks are: session start → first commit, then commit → next commit.
// The highest struggle score wins, if it lasted over 15 active minutes (prd.md §7).
export function bossFight(events, breakMin, hasClaude) {
  let best = null;
  let from = 0;
  events.forEach((e, i) => {
    if (e.type !== 'commit') return;
    const chunk = events.slice(from, i + 1);
    from = i;

    const minutes = activeMin(chunk, breakMin);
    const failed = chunk.filter((x) => x.type === 'command' && x.failed).length;
    const prompts = chunk.filter((x) => x.type === 'prompt').length;
    const edits = {};
    for (const x of chunk) if (x.type === 'edit') edits[x.files[0]] = (edits[x.files[0]] || 0) + 1;
    const repeats = Object.values(edits).reduce((s, n) => s + n - 1, 0);

    const score = minutes + failed * 10 + prompts * 5 + repeats * 5;
    if (minutes > 15 && (!best || score > best.score)) {
      best = {
        score,
        minutes,
        // most-edited file (ties: more lines in the ending commit); git-only: biggest file in that commit
        file: pickFile(edits, e.fileLines) ?? pickFile(e.fileLines),
        endedBy: e.message,
        failedCommands: hasClaude ? failed : null,
      };
    }
  });
  if (!best) return null;
  const { score, ...fight } = best;
  return fight;
}
