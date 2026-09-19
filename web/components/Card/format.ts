export const SITE = "postgame-pied.vercel.app";

export const CARD_ID = "pg-card"; // the element the PNG export captures

export const duration = (min: number) => (min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`);

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
