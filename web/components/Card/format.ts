export const SITE = "postgame-pied.vercel.app";

export const CARD_ID = "pg-card"; // the element the PNG export captures

// Real sessions shown as samples. The first one is the homepage hero card.
export const SAMPLES = [
  { id: "xa8mww", label: "The Boss Fight" },
  { id: "y97cmn", label: "Deep Work" },
  { id: "ihfgwn", label: "Autopilot" },
  { id: "4mqs9u", label: "No Claude logs" },
];
export const SAMPLE_ID = SAMPLES[0].id;
export const GITHUB_URL = "https://github.com/jaineel132/postgame";
export const NPM_URL = "https://www.npmjs.com/package/postgame-cli";

// Rarity = how unusual a title is, not how good the session was. The Grind is common because it's the fallback.
const TIER = {
  legendary: { name: "LEGENDARY", color: "#eab308" },
  epic: { name: "EPIC", color: "#a855f7" },
  rare: { name: "RARE", color: "#3b82f6" },
  common: { name: "COMMON", color: "#94a3b8" },
};
const TIER_OF: Record<string, keyof typeof TIER> = {
  "The Boss Fight": "legendary", "Clean Sweep": "legendary",
  "Death by a Thousand Cuts": "epic", "Backseat Driver": "epic",
  "Deep Work": "rare", "Autopilot": "rare", "Vibe Coded": "rare",
  "The Scattergun": "common", "The Grind": "common",
};
export const TIERS = Object.values(TIER);
export const tierOf = (title: string) => TIER[TIER_OF[title] ?? "common"];

export const duration =(min: number) => (min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`);

export const num = (n: number) => n.toLocaleString("en-US");

export const plural = (n: number, word: string) => `${num(n)} ${word}${n === 1 ? "" : "s"}`;

// Read the date straight from the ISO string so the server's timezone can't shift it.
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const day = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

// "src/lib/auth.js" → ["src/lib/", "auth.js"]
export const splitPath = (p: string) => {
  const i = p.lastIndexOf("/") + 1;
  return [p.slice(0, i), p.slice(i)] as const;
};
