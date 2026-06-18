import type { PlayerSeason, ScoredPlayer } from "./types";

export const MIN_RS_GP = 40;
export const MIN_MPG = 20;
export const MIN_PLAYOFF_GP = 4;
export const RANKING_LIMIT = 15;
/** Minimum impact to qualify for the diamond list (filters low-output youth-skew noise). */
export const MIN_DIAMOND_IMPACT = 65;

export function withDiamond(player: PlayerSeason): ScoredPlayer {
  return { ...player, diamond: player.impact - player.perception };
}

/** Player must have played meaningful minutes or meaningful playoff sample. */
export function isEligible(player: PlayerSeason): boolean {
  if (player.seasonLongInjury) return false;
  const rsQualified = player.rsGp >= MIN_RS_GP && player.mpg >= MIN_MPG;
  const playoffQualified = player.playoffGp >= MIN_PLAYOFF_GP;
  return rsQualified || playoffQualified;
}

export function getRankings(players: ScoredPlayer[]) {
  const polishedIds = new Set(
    players
      .filter((p) => p.impact >= 82 && p.perception >= 78)
      .map((p) => p.id),
  );

  const diamonds = [...players]
    .filter(
      (p) =>
        !polishedIds.has(p.id) &&
        p.diamond > 0 &&
        p.impact >= MIN_DIAMOND_IMPACT,
    )
    .sort((a, b) => b.diamond - a.diamond || b.impact - a.impact)
    .slice(0, RANKING_LIMIT);

  const foolGold = [...players]
    .filter((p) => p.diamond < 0)
    .sort((a, b) => a.diamond - b.diamond)
    .slice(0, RANKING_LIMIT);

  return { diamonds, foolGold };
}

export function scoreSeasonPool(
  seasonPlayers: readonly PlayerSeason[],
  position: string,
): ScoredPlayer[] {
  return seasonPlayers
    .filter((p) => position === "All" || p.pos === position)
    .filter(isEligible)
    .map(withDiamond);
}

/** @deprecated Prefer scoreSeasonPool(PLAYERS_BY_SEASON[season], pos) for indexed lookup. */
export function filterSeasonPlayers(
  players: PlayerSeason[],
  season: string,
  position: string,
): ScoredPlayer[] {
  return scoreSeasonPool(
    players.filter((p) => p.season === season),
    position,
  );
}

export function getPlayerSeasons(
  playerSeasons: readonly PlayerSeason[],
): ScoredPlayer[] {
  return playerSeasons
    .filter(isEligible)
    .map(withDiamond)
    .sort((a, b) => b.season.localeCompare(a.season));
}

export function getPlayerTrajectory(
  playerSeasons: readonly PlayerSeason[],
): Array<{ season: string; diamond: number; impact: number; perception: number }> {
  return playerSeasons
    .filter(isEligible)
    .map(withDiamond)
    .map((p) => ({
      season: p.season,
      diamond: p.diamond,
      impact: p.impact,
      perception: p.perception,
    }))
    .sort((a, b) => a.season.localeCompare(b.season));
}
