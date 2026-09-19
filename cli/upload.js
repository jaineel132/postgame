const BASE = process.env.POSTGAME_URL || 'https://postgame-pied.vercel.app';

// Returns the card URL, or throws with a readable reason.
export async function upload(payload) {
  const res = await fetch(`${BASE}/api/recap`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(body.error || `server answered ${res.status}`);
  return body.url;
}
