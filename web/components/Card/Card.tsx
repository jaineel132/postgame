import "./card.css";
import type { Recap } from "./types";
import { BigStats, BossFight, ClaudeStrip, Footer, Hero, SmallStats } from "./blocks";
import { CARD_ID } from "./format";

export default function Card({ recap }: { recap: Recap }) {
  const ai = recap.ai.available ? recap.ai : null;
  return (
    <div className="pg-frame" id={CARD_ID}>
      <article className={`pg-card${ai ? "" : " git-only"}${!ai && !recap.bossFight ? " sparse" : ""}`}>
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
