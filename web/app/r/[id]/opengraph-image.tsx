import { ImageResponse } from "next/og";
import type { Recap } from "@/components/Card/types";
import { day, duration, num, splitPath } from "@/components/Card/format";
import { redis, recapKey } from "@/lib/kv";
import { C, OG_SIZE, OgFrame, OgSword, clip, ogFonts, px } from "@/lib/og";

export const alt = "A postgame recap card";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recap = /^[a-z0-9]{6}$/.test(id) ? await redis.get<Recap>(recapKey(id)) : null;
  const fonts = await ogFonts();

  if (!recap) {
    return new ImageResponse(
      <OgFrame left="POSTGAME" right="">
        <div style={{ display: "flex", fontFamily: "Pixel", fontSize: 40, color: C.gold }}>NO RECAP HERE</div>
        <div style={{ display: "flex" }} />
      </OgFrame>,
      { ...size, fonts },
    );
  }

  const boss = recap.bossFight;
  const ai = recap.ai.available ? recap.ai : null;
  const third = ai && ai.claudeLinesPct !== null
    ? { v: `${ai.claudeLinesPct}%`, k: "by Claude" }
    : { v: num(recap.stats.linesChanged), k: "lines changed" };

  return new ImageResponse(
    <OgFrame left={`POSTGAME · ${clip(recap.repo, 22)}`} right={day(recap.startedAt)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 560 }}>
          <div style={{ display: "flex", fontFamily: "Pixel", fontSize: 46, lineHeight: 1.3, color: C.gold, textShadow: "4px 4px 0 #000", textTransform: "uppercase" }}>
            {recap.archetype.title}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: C.emerald }}>{clip(recap.archetype.subtitle, 90)}</div>
        </div>

        {boss ? (
          <div style={{ ...px(C.gold, C.goldDark, 6), display: "flex", flexDirection: "column", gap: 18, width: 440, padding: "30px 34px", color: C.ink }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "Pixel", fontSize: 18 }}>
              <OgSword size={22} />
              <span>BOSS FIGHT</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: "Pixel", fontSize: 84, lineHeight: 1 }}>{boss.minutes}</span>
              <span style={{ fontSize: 32, fontWeight: 700, color: C.inkSoft }}>MIN</span>
            </div>
            {boss.file && <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>{clip(splitPath(boss.file)[1], 24)}</div>}
          </div>
        ) : (
          <div style={{ ...px(C.emeraldBg, C.emerald, 6), display: "flex", flexDirection: "column", gap: 14, width: 440, padding: "30px 34px", color: C.emerald }}>
            <div style={{ display: "flex", fontFamily: "Pixel", fontSize: 22 }}>NO BOSS FIGHT</div>
            <div style={{ display: "flex", fontSize: 22 }}>Nothing held you up past 15 min.</div>
          </div>
        )}
      </div>

      <div style={{ ...px(C.panel, C.line), display: "flex", justifyContent: "space-around", alignItems: "center", padding: "20px 30px" }}>
        {[
          { v: duration(recap.durationMin), k: "session" },
          { v: num(recap.stats.commits), k: recap.stats.commits === 1 ? "commit" : "commits" },
          third,
        ].map((s) => (
          <div key={s.k} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: "Pixel", fontSize: 26, color: C.text }}>{s.v}</span>
            <span style={{ fontSize: 20, color: C.muted }}>{s.k}</span>
          </div>
        ))}
      </div>
    </OgFrame>,
    { ...size, fonts },
  );
}
