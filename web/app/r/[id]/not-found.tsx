import Link from "next/link";
import { SAMPLE_ID } from "@/components/Card/format";

export default function RecapNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="font-pixel text-3xl leading-snug text-[#eab308] [text-shadow:4px_4px_0_#000] sm:text-5xl">
        GAME OVER
      </h1>
      <p className="max-w-md text-[#a3acb5]">
        No recap lives at this link. Check the URL, or look at one that does.
      </p>
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <Link
          href={`/r/${SAMPLE_ID}`}
          className="font-pixel bg-[#eab308] px-5 py-3 text-xs text-[#1c1206] shadow-[0_4px_0_#854d0e] sm:text-sm"
        >
          SEE A SAMPLE RECAP
        </Link>
        <Link href="/" className="font-pixel border-2 border-[#2f4a40] px-5 py-3 text-xs text-[#a3acb5] hover:text-[#f8fafc] sm:text-sm">
          HOME
        </Link>
      </div>
    </main>
  );
}
