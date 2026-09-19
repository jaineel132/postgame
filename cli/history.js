import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// One JSON line per uploaded card, on this machine only.
const FILE = path.join(os.homedir(), '.postgame', 'history.jsonl');

// Best effort: a history that can't be written must never cost the user their link.
export function saveCard(entry) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.appendFileSync(FILE, JSON.stringify(entry) + '\n');
  } catch {}
}

export function readCards() {
  let text = '';
  try { text = fs.readFileSync(FILE, 'utf8'); } catch { return []; }
  return text.split('\n').flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } }).reverse();
}
