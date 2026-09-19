import { ImageResponse } from "next/og";
import { C, OG_SIZE, OgFrame, ogFonts, px } from "@/lib/og";

export const alt = "postgame — Spotify Wrapped for a single coding session";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgFrame left="POSTGAME" right="npx postgame-cli">
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", fontFamily: "Pixel", fontSize: 52, lineHeight: 1.3, color: C.gold, textShadow: "4px 4px 0 #000" }}>
          YOUR SESSION, RECAPPED
        </div>
        <div style={{ display: "flex", fontSize: 30, color: C.emerald }}>
          Spotify Wrapped for a single coding session — from your git history and Claude Code logs.
        </div>
      </div>
      <div style={{ ...px(C.panel, C.line), display: "flex", justifyContent: "space-around", padding: "20px 30px", fontSize: 22, color: C.muted }}>
        <span>boss fights</span><span>flow state</span><span>MVP file</span><span>how much Claude wrote</span>
      </div>
    </OgFrame>,
    { ...size, fonts: await ogFonts() },
  );
}
