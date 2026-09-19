import type { Ai, Recap } from "./types";
import { SITE, day, duration, num, plural, splitPath, tierOf } from "./format";

export function Sword() {
  return (
    <svg className="sword" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M6 0h2v1h-2zM5 1h2v1h-2zM4 2h2v1h-2zM3 3h2v1h-2zM1 3h1v1h-1zM2 4h1v1h-1zM3 5h1v1h-1zM1 5h1v1h-1zM0 6h1v2h-1z" />
    </svg>
  );
}

export function Hero({ repo, startedAt, archetype }: Pick<Recap, "repo" | "startedAt" | "archetype">) {
  return (
    <>
      <div className="top-bar">
        <div className="brand pixel"><Sword />POSTGAME</div>
        <div className="top-right">
          <span className="tier px pixel">{tierOf(archetype.title).name}</span>
          <span>{repo} · {day(startedAt)}</span>
        </div>
      </div>
      <div className="hero">
        <h1 className="archetype-title pixel">{archetype.title}</h1>
        <p className="subtitle">{archetype.subtitle}</p>
      </div>
    </>
  );
}

export function BigStats({ durationMin, stats }: Pick<Recap, "durationMin" | "stats">) {
  const third = stats.longestFlowMin !== null
    ? { num: `${stats.longestFlowMin}m`, lbl: "LONGEST FLOW" }
    : { num: num(stats.linesChanged), lbl: "LINES CHANGED" }; // git-only
  return (
    <div className="big-stats px">
      <Stat num={duration(durationMin)} lbl="SESSION" />
      <Stat num={num(stats.commits)} lbl="COMMITS" />
      <Stat {...third} />
    </div>
  );
}

function Stat({ num, lbl }: { num: string; lbl: string }) {
  return <div className="stat"><div className="num pixel">{num}</div><div className="lbl">{lbl}</div></div>;
}

export function BossFight({ bossFight }: Pick<Recap, "bossFight">) {
  if (!bossFight) {
    return (
      <div className="no-boss px">
        <span className="pixel">✓ NO BOSS FIGHT</span>
        <span>Nothing held you up past 15 min.</span>
      </div>
    );
  }
  const [dir, base] = bossFight.file ? splitPath(bossFight.file) : ["", ""];
  return (
    <div className="boss-fight px px-lg">
      <div className="cleared px pixel">LEVEL CLEARED</div>
      <div className="boss-head pixel"><Sword />BOSS FIGHT</div>
      <div className="boss-body">
        <div className="boss-min"><span className="n pixel">{bossFight.minutes}</span><span className="u">MIN</span></div>
        <div className="boss-details">
          {bossFight.file && (
            <div className="centred" title={bossFight.file}>
              <span>centred on </span><span className="dir">{dir}</span><span className="file">{base}</span>
            </div>
          )}
          {!!bossFight.failedCommands && <div className="failed px">{plural(bossFight.failedCommands, "failed command")}</div>}
        </div>
      </div>
      <div className="ended px"><span>ended by</span><span className="msg">&ldquo;{bossFight.endedBy}&rdquo;</span></div>
    </div>
  );
}

export function ClaudeStrip({ ai }: { ai: Ai }) {
  return (
    <div className="claude-strip px">
      <div className="claude-head pixel">CLAUDE COMPANION</div>
      <div className="claude-grid">
        <ClaudeItem val={ai.claudeLinesPct === null ? "—" : `${ai.claudeLinesPct}%`} desc="of the lines Claude wrote" />
        <ClaudeItem val={`${ai.interrupts}×`} desc="you stopped Claude" />
        <ClaudeItem val={ai.promptsPerCommit === null ? "—" : String(ai.promptsPerCommit)} desc={`prompts per commit · ${plural(ai.prompts, "prompt")}`} />
      </div>
    </div>
  );
}

function ClaudeItem({ val, desc }: { val: string; desc: string }) {
  return <div className="claude-item"><div className="val pixel">{val}</div><div className="desc">{desc}</div></div>;
}

export function SmallStats({ stats, streak, mvpFile, withLines }: Pick<Recap, "stats" | "streak" | "mvpFile"> & { withLines: boolean }) {
  return (
    <div className={`small-stats${withLines ? "" : " three"}`}>
      <Small lbl="MVP FILE" val={mvpFile ? splitPath(mvpFile.path)[1] : "—"} sub={mvpFile ? plural(mvpFile.commits, "commit") : "no files"} />
      <Small lbl="BEST STREAK" val={streak ? plural(streak.commits, "commit") : "—"} sub={streak ? `in ${streak.withinMin} min` : "no streak"} />
      <Small lbl="FILES TOUCHED" val={num(stats.filesTouched)} sub="files" />
      {withLines && <Small lbl="LINES CHANGED" val={num(stats.linesChanged)} sub="lines" />}
    </div>
  );
}

function Small({ lbl, val, sub }: { lbl: string; val: string; sub: string }) {
  return <div className="small px"><div className="s-lbl">{lbl}</div><div className="s-val" title={val}>{val}</div><div className="s-sub">{sub}</div></div>;
}

export function Footer() {
  return <div className="footer"><div className="cmd">{SITE} · npx postgame-cli</div><div>Not affiliated with Anthropic</div></div>;
}
