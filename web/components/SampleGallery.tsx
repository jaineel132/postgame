import type { CSSProperties } from "react";
import Link from "next/link";
import Card from "@/components/Card/Card";
import type { Recap } from "@/components/Card/types";
import { SAMPLES } from "@/components/Card/format";
import { redis, recapKey } from "@/lib/kv";

export async function getSamples() {
  try {
    const recaps = await redis.mget<(Recap | null)[]>(...SAMPLES.map((s) => recapKey(s.id)));
    return SAMPLES.map((s, i) => ({ ...s, recap: recaps[i] })).filter((s) => s.recap) as
      (typeof SAMPLES[number] & { recap: Recap })[];
  } catch {
    return []; // storage down: the section just hides
  }
}

// The samples as a fanned hand of cards: dealt in on load, hover/focus pops one out (CSS: .deck in globals.css).
export default async function SampleGallery({ current }: { current?: string }) {
  const samples = (await getSamples()).filter((s) => s.id !== current);
  if (!samples.length) return null;
  const mid = (samples.length - 1) / 2;

  return (
    <div className="deck">
      {samples.map((s, i) => (
        <Link
          key={s.id}
          href={`/r/${s.id}`}
          className="deck-card"
          aria-label={`${s.label} · ${s.recap.repo} — open this recap`}
          // fan position: tilt from the centre, outer cards sit a little lower
          style={{ "--i": i, "--r": `${(i - mid) * 8}deg`, "--y": `${(i - mid) ** 2 * 10}px` } as CSSProperties}
        >
          <Card recap={s.recap} idless />
          <span className="deck-label font-pixel">{s.label.toUpperCase()} · {s.recap.repo}</span>
        </Link>
      ))}
    </div>
  );
}
