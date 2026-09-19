"use client";

import { useEffect, useState } from "react";
import { getFontEmbedCSS, toBlob } from "html-to-image";
import { CARD_ID } from "./format";

// Renders the card at its design size (1080×1350) into a PNG — in the browser, no server.
// Captures an off-screen copy pinned at 1080px (.pg-export sets --u: 1px), so the page never jumps.
async function renderCard(fileName: string) {
  const card = document.getElementById(CARD_ID);
  if (!card) throw new Error("card not found");

  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;";
  const copy = card.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  copy.classList.add("pg-export");
  holder.append(copy);
  document.body.append(holder);

  try {
    const opts = {
      width: 1080,
      height: 1350,
      pixelRatio: 1,
      backgroundColor: "#030806",
      fontEmbedCSS: await getFontEmbedCSS(copy),
    };
    await toBlob(copy, opts); // first pass is known to miss fonts; the second one has them
    const blob = await toBlob(copy, opts);
    if (!blob) throw new Error("empty image");
    return new File([blob], fileName, { type: "image/png" });
  } finally {
    holder.remove();
  }
}

const button =
  "font-[family-name:var(--font-pixel)] text-xs sm:text-sm px-5 py-3 shadow-[0_4px_0_#854d0e] active:translate-y-1 active:shadow-none disabled:opacity-60";

export default function CardActions({ fileName }: { fileName: string }) {
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [failed, setFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const probe = new File([""], "x.png", { type: "image/png" });
    setCanShare(typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }));
  }, []);

  async function run(kind: "download" | "share") {
    setBusy(kind);
    setFailed(false);
    try {
      const file = await renderCard(fileName);
      if (kind === "share") {
        await navigator.share({ files: [file] }).catch((e) => {
          if (e?.name !== "AbortError") throw e; // closing the share sheet isn't an error
        });
      } else {
        const url = URL.createObjectURL(file);
        const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-4">
        <button onClick={() => run("download")} disabled={busy !== null} className={`${button} bg-[#eab308] text-[#1c1206]`}>
          {busy === "download" ? "SAVING…" : "DOWNLOAD PNG"}
        </button>
        {canShare && (
          <button onClick={() => run("share")} disabled={busy !== null} className={`${button} bg-[#10b981] text-[#062117] shadow-[0_4px_0_#0b7a57]`}>
            {busy === "share" ? "PREPARING…" : "SHARE IMAGE"}
          </button>
        )}
      </div>
      {failed && <p className="text-sm text-[#fca5a5]">Couldn&apos;t make the image — try again, or take a screenshot.</p>}
    </div>
  );
}
