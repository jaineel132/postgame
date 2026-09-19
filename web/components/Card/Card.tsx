import "./card.css";
import type { Recap } from "./types";
import { BigStats, BossFight, ClaudeStrip, Footer, Hero, SmallStats } from "./blocks";
import type { CSSProperties } from "react";
import { CARD_ID, tierOf } from "./format";

// `idless` for extra cards on a page (gallery), so the PNG export only ever finds the main one.
export default function Card({ recap, idless = false }: { recap: Recap; idless?: boolean }) {
  const ai = recap.ai.available ? recap.ai : null;
  return (
    <div className="pg-frame" id={idless ? undefined : CARD_ID}>
      <article
        className={`pg-card${ai ? "" : " git-only"}${!ai && !recap.bossFight ? " sparse" : ""}`}
        style={{ "--tier": tierOf(recap.archetype.title).color } as CSSProperties}
      >
        <div className="recap px px-lg">
          <Hero repo={recap.repo} startedAt={recap.startedAt} archetype={recap.archetype} />
          <BigStats durationMin={recap.durationMin} stats={recap.stats} />
          <BossFight bossFight={recap.bossFight} />
          {ai && <ClaudeStrip ai={ai} />}
          {/* git-only: lines changed already sits in BigStats, so only three small boxes */}
          <SmallStats stats={recap.stats} streak={recap.streak} mvpFile={recap.mvpFile} withLines={Boolean(ai)} />
          <Footer />
        </div>
      </article>
    </div>
  );
}
