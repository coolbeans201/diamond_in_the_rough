import { PLAYERS } from "../data/players";
import { withDiamond } from "../lib/scoring";

const scored = PLAYERS.map(withDiamond);

function peak(id: string) {
  const rows = scored.filter((p) => p.id === id);
  if (!rows.length) return null;
  return rows.reduce((a, b) => (a.diamond > b.diamond ? a : b));
}

const ids = [
  "reaves",
  "payton-pritchard",
  "brunson",
  "mobley",
  "maxey",
  "herbert-jones",
  "caruso",
  "sga",
  "white",
  "hart",
  "jalen-williams",
  "gobert",
  "jokic",
];

for (const id of ids) {
  const p = peak(id);
  if (p) console.log(`${id}\t${p.season}\td=${p.diamond}\t${p.impact}/${p.perception}`);
  else console.log(`${id}\tNOT FOUND`);
}

console.log("\n--- top peaks 2023-26 ---");
const recent = scored
  .filter((p) => p.season >= "2023-24" && p.diamond > 6)
  .sort((a, b) => b.diamond - a.diamond);
recent.slice(0, 25).forEach((p) =>
  console.log(`${p.season}\t${p.id}\t${p.name}\td=${p.diamond}\t${p.impact}/${p.perception}`),
);
