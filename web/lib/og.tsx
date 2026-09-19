// Shared pieces for the 1200×630 link-preview images (board 5 of the design).
// The OG renderer only understands flexbox and inline styles: no CSS variables, no grid,
// every element with more than one child needs display:flex.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CSSProperties, ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

export const C = {
  page: "#030806", bg: "#091310", text: "#f8fafc", gold: "#eab308", emerald: "#10b981",
  panel: "#12221c", line: "#2f4a40", muted: "#a3acb5", goldDark: "#854d0e",
  ink: "#1c1206", inkSoft: "#713f12", emeraldBg: "#0c2a20",
};

const font = (file: string) => readFile(join(process.cwd(), "assets", file));

export async function ogFonts() {
  const [pixel, mono, monoBold] = await Promise.all([
    font("PressStart2P-Regular.ttf"), font("JetBrainsMono-Regular.ttf"), font("JetBrainsMono-Bold.ttf"),
  ]);
  return [
    { name: "Pixel", data: pixel, weight: 400 as const, style: "normal" as const },
    { name: "Mono", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "Mono", data: monoBold, weight: 700 as const, style: "normal" as const },
  ];
}

// The .px pixel-corner staircase from card.css, as an inline style.
export function px(fill: string, bd: string, p = 4): CSSProperties {
  const s = (x: number, y: number, c: string) => `${x * p}px ${y * p}px 0 0 ${c}`;
  return {
    background: fill,
    boxShadow: [
      s(0, -1, fill), s(0, 1, fill), s(-1, 0, fill), s(1, 0, fill),
      s(0, -2, bd), s(0, 2, bd), s(-2, 0, bd), s(2, 0, bd),
      s(1, 1, bd), s(-1, 1, bd), s(1, -1, bd), s(-1, -1, bd),
    ].join(", "),
  };
}

export function OgSword({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" shapeRendering="crispEdges">
      <path d="M6 0h2v1h-2zM5 1h2v1h-2zM4 2h2v1h-2zM3 3h2v1h-2zM1 3h1v1h-1zM2 4h1v1h-1zM3 5h1v1h-1zM1 5h1v1h-1zM0 6h1v2h-1z" />
    </svg>
  );
}

// Page background + the gold-bordered card, with a top bar (left / right) and the rest below.
export function OgFrame({ left, right, children }: { left: string; right: string; children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", padding: 20, background: C.page, fontFamily: "Mono" }}>
      <div style={{ ...px(C.bg, C.gold, 6), flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: C.muted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Pixel", fontSize: 20, color: C.gold }}>
            <OgSword />
            <span>{left}</span>
          </div>
          <span>{right}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
