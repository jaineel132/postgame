import { notFound } from "next/navigation";
import { redis, recapKey } from "@/lib/kv";

// Placeholder view — the real card replaces this in the card block.
export default async function RecapPage({ params }: PageProps<"/r/[id]">) {
  const { id } = await params;
  const recap = /^[a-z0-9]{6}$/.test(id) ? await redis.get<{ archetype: { title: string; subtitle: string } }>(recapKey(id)) : null;
  if (!recap) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">{recap.archetype.title}</h1>
      <p className="opacity-70">{recap.archetype.subtitle}</p>
      <pre className="overflow-x-auto rounded bg-black/10 p-4 text-sm dark:bg-white/10">
        {JSON.stringify(recap, null, 2)}
      </pre>
    </main>
  );
}
