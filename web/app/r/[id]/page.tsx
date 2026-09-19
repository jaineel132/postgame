import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Card from "@/components/Card/Card";
import CardActions from "@/components/Card/CardActions";
import type { Recap } from "@/components/Card/types";
import { redis, recapKey } from "@/lib/kv";

// One Redis read per request, shared by the metadata and the page.
const getRecap = cache(async (id: string) =>
  /^[a-z0-9]{6}$/.test(id) ? redis.get<Recap>(recapKey(id)) : null,
);

export async function generateMetadata({ params }: PageProps<"/r/[id]">): Promise<Metadata> {
  const recap = await getRecap((await params).id);
  if (!recap) return { title: "No recap here — postgame" };
  const title = `${recap.archetype.title} · ${recap.repo} — postgame`;
  const description = recap.archetype.subtitle;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RecapPage({ params }: PageProps<"/r/[id]">) {
  const recap = await getRecap((await params).id);
  if (!recap) notFound();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:py-12">
      {/* fit the whole card on screen: 600px wide at most, or less if the window is short */}
      <div className="w-full max-w-[min(600px,calc((100svh-7rem)*0.8))] min-w-[280px]">
        <Card recap={recap} />
      </div>
      <CardActions fileName={`postgame-${recap.repo.replace(/[^\w.-]+/g, "-")}-${recap.startedAt.slice(0, 10)}.png`} />
      <p className="text-sm text-[#a3acb5]">
        Make your own: <code className="text-[#eab308]">npx postgame-cli</code>
      </p>
    </main>
  );
}
