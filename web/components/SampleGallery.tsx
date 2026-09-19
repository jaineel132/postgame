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

// A row of small real cards, like a level-select screen. Scrolls sideways on phones.
export default async function SampleGallery({ current }: { current?: string }) {
  const samples = (await getSamples()).filter((s) => s.id !== current);
  if (!samples.length) return null;

  return (
    <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {samples.map((s) => (
        <Link key={s.id} href={`/r/${s.id}`} className="group flex w-[220px] shrink-0 snap-start flex-col gap-3 sm:w-auto">
          <div className="transition-transform group-hover:-translate-y-1">
            <Card recap={s.recap} idless />
          </div>
          <span className="font-pixel text-[10px] text-[#a3acb5] group-hover:text-[#eab308]">
            {s.label.toUpperCase()} · {s.recap.repo}
          </span>
        </Link>
      ))}
    </div>
  );
}
