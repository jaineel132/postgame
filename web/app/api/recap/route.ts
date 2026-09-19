import { randomInt } from "node:crypto";
import { redis, recapKey } from "@/lib/kv";

const MAX_BYTES = 64 * 1024;
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o/1/l lookalikes

const newId = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BYTES) return fail("payload too large", 413);

  let body;
  try { body = JSON.parse(text); } catch { return fail("invalid JSON", 400); }
  if (body?.v !== 1 || typeof body.repo !== "string" || typeof body.archetype?.title !== "string") {
    return fail("not a postgame v1 payload", 400);
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    if (await redis.set(recapKey(id), body, { nx: true })) {
      return Response.json({ id, url: `${new URL(request.url).origin}/r/${id}` }, { status: 201 });
    }
  }
  return fail("could not allocate an id", 500);
}
