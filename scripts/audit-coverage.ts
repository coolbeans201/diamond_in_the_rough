import { PLAYERS_BY_SEASON } from "@/data/players";
import { getRankings, scoreSeasonPool } from "@/lib/scoring";
import { SEASONS } from "@/lib/types";

for (const season of SEASONS) {
  const pool = scoreSeasonPool(PLAYERS_BY_SEASON[season] ?? [], "All");
  const { diamonds, foolGold } = getRankings(pool);
  const pos = pool.filter((p) => p.diamond > 0).length;
  const neg = pool.filter((p) => p.diamond < 0).length;
  console.log(
    `${season}: pool=${pool.length} diamonds=${diamonds.length} foolGold=${foolGold.length} (+${pos}/-${neg})`,
  );
}
