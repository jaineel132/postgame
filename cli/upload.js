const BASE = process.env.POSTGAME_URL || 'https://postgame-pied.vercel.app';

// Returns the card URL, or throws with a readable reason.
export async function upload(payload) {
  let res;
  try {
    res = await fetch(`${BASE}/api/recap`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    throw new Error(`could not reach ${BASE}${process.env.POSTGAME_URL ? ' (set by POSTGAME_URL)' : ''}: ${e.message}`);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(`${BASE} answered: ${body.error || res.status}`);
  return body.url;
}
