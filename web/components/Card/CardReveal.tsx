import type { CSSProperties } from "react";
import Card from "./Card";
import type { Recap } from "./types";
import { Sword } from "./blocks";
import { tierOf } from "./format";

// The card lands face down, spins, and settles face up with a glow in its rarity colour (CSS: .reveal in globals.css).
export default function CardReveal({ recap, idless = false }: { recap: Recap; idless?: boolean }) {
  return (
    <div className="reveal" style={{ "--tier": tierOf(recap.archetype.title).color } as CSSProperties}>
      <div className="reveal-inner">
        <div className="reveal-back pg-px" aria-hidden="true">
          <span className="text-[#eab308] [&_svg]:h-[22cqw] [&_svg]:w-[22cqw] [&_svg]:fill-current"><Sword /></span>
          <span className="font-pixel text-[5cqw] text-[#eab308]">POSTGAME</span>
        </div>
        <div className="reveal-front">
          <Card recap={recap} idless={idless} />
        </div>
      </div>
    </div>
  );
}
