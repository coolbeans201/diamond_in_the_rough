import type { HallEntry, PlayerProfile, CuratedPlayerSeason, PlayerSeason } from "@/lib/types";
import { SEASONS } from "@/lib/types";
import { buildPlayerPool } from "@/lib/build-player-pool";
import { CONTEMPORARY_ENTRIES } from "./entries-contemporary";
import { LEGACY_ENTRIES } from "./entries-legacy";
import { RECENT_ENTRIES } from "./entries-recent";

function mergeCurated(...groups: CuratedPlayerSeason[][]): CuratedPlayerSeason[] {
  const map = new Map<string, CuratedPlayerSeason>();
  for (const group of groups) {
    for (const player of group) {
      map.set(`${player.season}:${player.id}`, player);
    }
  }
  return Array.from(map.values());
}

/** Hand-tuned impact/perception overrides for featured players */
const CURATED = mergeCurated(LEGACY_ENTRIES, RECENT_ENTRIES, CONTEMPORARY_ENTRIES);

/**
 * Full season pool: every eligible NBA player (from stats.nba.com)
 * with curated score overrides where available.
 */
export const PLAYERS = buildPlayerPool(CURATED);

function indexPlayers(players: PlayerSeason[]) {
  const bySeason: Record<string, PlayerSeason[]> = Object.fromEntries(
    SEASONS.map((season) => [season, []]),
  );
  const byId = new Map<string, PlayerSeason[]>();

  for (const player of players) {
    bySeason[player.season]?.push(player);
    const list = byId.get(player.id) ?? [];
    list.push(player);
    byId.set(player.id, list);
  }

  return { bySeason, byId };
}

const indexes = indexPlayers(PLAYERS);

/** Pre-grouped pool — avoids scanning all ~3k player-seasons on every page request. */
export const PLAYERS_BY_SEASON: Readonly<Record<string, readonly PlayerSeason[]>> =
  indexes.bySeason;

/** All eligible seasons for a stable player id (for trajectories / profiles). */
export const PLAYERS_BY_ID: ReadonlyMap<string, readonly PlayerSeason[]> = indexes.byId;

export { POOL_GENERATED_AT } from "@/lib/build-player-pool";

export const HALL_OF_DIAMONDS: HallEntry[] = [
  { id: "brunson", name: "Jalen Brunson", seasons: "2022-23, 2023-24, 2024-25", outcome: "2026 Finals MVP, Knicks champion", peakDiamond: 29 },
  { id: "maxey", name: "Tyrese Maxey", seasons: "2021-22, 2022-23", outcome: "All-Star, 30th pick breakout", peakDiamond: 32 },
  { id: "jalen-williams", name: "Jalen Williams", seasons: "2022-23, 2023-24", outcome: "All-NBA trajectory, 12th pick", peakDiamond: 25 },
  { id: "mobley", name: "Evan Mobley", seasons: "2021-22, 2022-23", outcome: "DPOY-caliber defender, 3rd pick", peakDiamond: 24 },
  { id: "hart", name: "Josh Hart", seasons: "2022-23, 2024-25", outcome: "Title-team glue, winning minutes", peakDiamond: 24 },
  { id: "white", name: "Derrick White", seasons: "2022-23, 2023-24", outcome: "Champion starter, low profile", peakDiamond: 27 },
  { id: "caruso", name: "Alex Caruso", seasons: "2019-20, 2020-21", outcome: "Champion, undrafted defender", peakDiamond: 30 },
];

export const PROFILES: Record<string, PlayerProfile> = {
  brunson: {
    id: "brunson",
    name: "Jalen Brunson",
    team: "NYK",
    pos: "PG",
    tagline: "Flagship diamond — impact preceded perception by three seasons",
    stats: [
      { label: "2026 Finals PPG", value: "32.6" },
      { label: "4Q Finals PPG", value: "11.2" },
      { label: "Clutch POY", value: "2025" },
      { label: "Playoff TS%", value: "53.6%" },
      { label: "Offensive EPM", value: "+4.9" },
      { label: "Knicks playoff PPG", value: "29.2" },
    ],
    doubts: [
      { take: "He shoots too much / isn't efficient", rebuttal: "53.6% TS in Finals on 26.6 FGA/game; 86% FT draws traps and absorbs pressure." },
      { take: "He's a defensive liability", rebuttal: "Offensive EPM ranked #1 in 2025 playoffs (+4.9); team DRtg dropped to 98.2 per 100 when he sat." },
      { take: "Towns or Bridges carried him", rebuttal: "163 Finals points, unanimous FMVP, 11.2 4Q PPG — highest in play-by-play era." },
      { take: "Second-round pick / overpaid", rebuttal: "FMVP as a 33rd pick; one of five players with NCAA + NBA titles and Finals MVP." },
      { take: "One hot series", rebuttal: "29.2 PPG across 61 Knicks playoff games — company of Jordan, LeBron, Iverson." },
    ],
  },
  maxey: {
    id: "maxey",
    name: "Tyrese Maxey",
    team: "PHI",
    pos: "PG",
    tagline: "30th pick with star scoring burden and elite clutch efficiency",
    stats: [
      { label: "Draft slot", value: "30th" },
      { label: "Playoff PPG", value: "28.1" },
      { label: "Clutch TS%", value: "58.2%" },
      { label: "Diamond peak", value: "+32" },
    ],
  },
  "jalen-williams": {
    id: "jalen-williams",
    name: "Jalen Williams",
    team: "OKC",
    pos: "SG",
    tagline: "12th pick two-way wing with elite on/off impact",
    stats: [
      { label: "Draft slot", value: "12th" },
      { label: "On/off net", value: "+5.1" },
      { label: "Playoff GP", value: "18" },
      { label: "Diamond peak", value: "+25" },
    ],
  },
  mobley: {
    id: "mobley",
    name: "Evan Mobley",
    team: "CLE",
    pos: "PF",
    tagline: "Defensive anchor whose impact exceeds his offensive reputation",
    stats: [
      { label: "Defensive EPM", value: "Top 5" },
      { label: "Playoff TS%", value: "58%" },
      { label: "Draft slot", value: "3rd" },
      { label: "Diamond peak", value: "+27" },
    ],
  },
  hart: {
    id: "hart",
    name: "Josh Hart",
    team: "NYK",
    pos: "SG",
    tagline: "Winning-minutes engine with low national visibility",
    stats: [
      { label: "2026 on/off", value: "+8.4" },
      { label: "Playoff GP", value: "19" },
      { label: "Rebounds/G", value: "8.2" },
      { label: "Diamond peak", value: "+24" },
    ],
  },
};
