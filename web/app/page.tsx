import Link from "next/link";
import CardReveal from "@/components/Card/CardReveal";
import CopyCommand from "@/components/CopyCommand";
import SampleGallery from "@/components/SampleGallery";
import { Sword } from "@/components/Card/blocks";
import type { Recap } from "@/components/Card/types";
import { GITHUB_URL, NPM_URL, SAMPLE_ID, TIERS, tierOf } from "@/components/Card/format";
import { redis, recapKey } from "@/lib/kv";

// Rebuild the page (and re-read the sample card) at most once an hour.
export const revalidate = 3600;

async function getSample() {
  try {
    return await redis.get<Recap>(recapKey(SAMPLE_ID));
  } catch {
    return null; // storage down: the page still works, just without the live card
  }
}

const STEPS = [
  ["Code", "Work with Claude Code and commit as usual."],
  ["Run", "npx postgame-cli in your project folder."],
  ["Share", "Get a link that previews in chat, or save the card as a PNG."],
];

const FEATURES = [
  ["Boss fight", "The hardest stretch between two commits, the file it centred on, and the commit that ended it."],
  ["Flow state", "Your longest run with something happening every few minutes."],
  ["Claude companion", "How much of the committed code Claude wrote, and how often you stopped it."],
  ["MVP file", "The file that dominated the session."],
];

const TITLES = [
  "The Boss Fight", "Death by a Thousand Cuts", "Clean Sweep", "Autopilot", "Backseat Driver",
  "Deep Work", "The Scattergun", "Vibe Coded", "The Grind",
];

const heading = "font-pixel text-sm text-[#10b981] sm:text-base";

export default async function Home() {
  const sample = await getSample();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-12 sm:py-16">
      {/* Hero + live sample card */}
      <section className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col items-start gap-6">
          <span className="font-pixel flex items-center gap-3 text-sm text-[#eab308] [&_svg]:h-5 [&_svg]:w-5 [&_svg]:fill-current">
            <Sword />POSTGAME
          </span>
          <h1 className="font-pixel text-2xl leading-snug text-[#eab308] [text-shadow:3px_3px_0_#000] sm:text-5xl sm:leading-snug sm:[text-shadow:4px_4px_0_#000]">
            YOUR SESSION, RECAPPED
          </h1>

          {/* MY TAGLINE — write your own words between the tags */}
          <p className="max-w-xl text-lg text-[#10b981]">The 143-minute bug. The file that fought back. Your session isn&apos;t lines typed any more, it&apos;s prompts and test runs and the bit where you gave up and fixed it yourself.</p>
          <CopyCommand command="npx postgame-cli" />

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={`/r/${SAMPLE_ID}`}
              className="font-pixel bg-[#eab308] px-5 py-3 text-xs text-[#1c1206] shadow-[0_4px_0_#854d0e] sm:text-sm"
            >
              SEE A SAMPLE RECAP
            </Link>
            <a
              href={GITHUB_URL}
              className="font-pixel border-2 border-[#2f4a40] px-5 py-3 text-xs text-[#a3acb5] hover:text-[#f8fafc] sm:text-sm"
            >
              GITHUB
            </a>
          </div>
        </div>

        {sample && (
          <Link href={`/r/${SAMPLE_ID}`} aria-label="Open the sample recap" className="mx-auto w-full max-w-[420px]">
            <CardReveal recap={sample} idless />
          </Link>
        )}
      </section>

      {/* Sample recaps — all real sessions */}
      <section id="samples" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className={heading}>SAMPLE RECAPS</h2>
          <p className="text-[#a3acb5]">Real sessions, real numbers. Pick one to open the full card.</p>
        </div>
        <SampleGallery />
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-6">
        <h2 className={heading}>HOW IT WORKS</h2>
        <ol className="grid gap-8 sm:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="pg-px flex flex-col gap-3 p-5 [--bd:#2f4a40] [--fill:#12221c]">
              <span className="font-pixel text-lg text-[#eab308]">{i + 1}. {title.toUpperCase()}</span>
              <span className="text-[#a3acb5]">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* What's on the card */}
      <section className="flex flex-col gap-6">
        <h2 className={heading}>WHAT&apos;S ON THE CARD</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {FEATURES.map(([title, text]) => (
            <div key={title} className="pg-px flex flex-col gap-2 p-5 [--bd:#2f4a40] [--fill:#12221c]">
              <span className="font-bold text-[#f8fafc]">{title}</span>
              <span className="text-[#a3acb5]">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-[#a3acb5]">
          Plus a title picked by plain rules, not AI:{" "}
          {TITLES.map((t, i) => (
            <span key={t}>
              <span style={{ color: tierOf(t).color }}>{t}</span>
              {i < TITLES.length - 1 ? " · " : "."}
            </span>
          ))}
        </p>
        <p className="text-[#a3acb5]">
          Titles come in four rarities —{" "}
          {TIERS.map((t, i) => (
            <span key={t.name}>
              <span className="font-pixel text-xs" style={{ color: t.color }}>{t.name}</span>
              {i < TIERS.length - 1 ? ", " : ""}
            </span>
          ))}
          {" "}— by how dramatic the session was, not how good it was. The link doesn&apos;t tell you which one you got: open it and watch the card turn over.
        </p>
      </section>

      {/* Privacy */}
      <section className="pg-px flex flex-col gap-3 p-6 [--bd:#10b981] [--fill:#0c2a20]">
        <h2 className={heading}>ONLY NUMBERS LEAVE YOUR MACHINE</h2>
        <p className="text-[#a3acb5]">
          Everything is worked out locally from your git history and your Claude Code logs. The upload is just numbers,
          your repo name, file paths and one commit message. No source code, no prompts, no file contents. Run{" "}
          <code className="text-[#f8fafc]">npx postgame-cli --dry-run</code> to see exactly what would be sent.
        </p>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t-2 border-dashed border-[#2f4a40] pt-6 text-sm text-[#8b95a1]">
        <span>
          <a href={GITHUB_URL} className="hover:text-[#f8fafc]">GitHub</a> ·{" "}
          <a href={NPM_URL} className="hover:text-[#f8fafc]">npm</a>
        </span>
        <span>Not affiliated with Anthropic</span>
      </footer>
    </main>
  );
}
