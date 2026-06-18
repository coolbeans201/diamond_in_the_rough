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

/** Featured-player metadata (highlights, confidence, injury flags). */
const FEATURED = mergeCurated(LEGACY_ENTRIES, RECENT_ENTRIES, CONTEMPORARY_ENTRIES);

/**
 * Full season pool: every eligible NBA player (from stats.nba.com)
 * with impact/perception from the unified formula.
 */
export const PLAYERS = buildPlayerPool(FEATURED);

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
  { id: "reaves", name: "Austin Reaves", seasons: "2023-24, 2024-25", outcome: "Undrafted starter, Team USA, perception caught up", peakDiamond: 8 },
  { id: "brunson", name: "Jalen Brunson", seasons: "2021-22, 2022-23, 2023-24", outcome: "33rd pick → All-NBA Knicks star", peakDiamond: 12 },
  { id: "maxey", name: "Tyrese Maxey", seasons: "2023-24, 2024-25", outcome: "All-Star on a 30th-pick contract", peakDiamond: 9 },
  { id: "isaiah-hartenstein", name: "Isaiah Hartenstein", seasons: "2023-24, 2024-25", outcome: "Undrafted big, elite on/off anchor", peakDiamond: 12 },
  { id: "amen-thompson", name: "Amen Thompson", seasons: "2024-25, 2025-26", outcome: "Defensive wing motor, 4th pick still underrated", peakDiamond: 12 },
  { id: "jalen-williams", name: "Jalen Williams", seasons: "2023-24, 2024-25", outcome: "Two-way Thunder wing, 12th pick", peakDiamond: 8 },
  { id: "scottie-barnes", name: "Scottie Barnes", seasons: "2023-24, 2024-25", outcome: "Franchise two-way forward, ROY pick", peakDiamond: 10 },
];

export const PROFILES: Record<string, PlayerProfile> = {
  reaves: {
    id: "reaves",
    name: "Austin Reaves",
    team: "LAL",
    pos: "SG",
    tagline: "Flagship case — undrafted rotation player the model flagged before the league fully priced him in",
    stats: [
      { label: "Draft slot", value: "Undrafted" },
      { label: "Peak diamond", value: "+8" },
      { label: "2024-25 impact", value: "79" },
      { label: "2025-26 impact", value: "82" },
      { label: "2025-26 perception", value: "83" },
      { label: "Diamond gap closed", value: "2025-26" },
    ],
    doubts: [
      { take: "He's just a Laker role player", rebuttal: "Impact hit 79–82 across two seasons with starter minutes and primary creation duties — not a spot-up specialist profile." },
      { take: "Undrafted guys don't sustain it", rebuttal: "Perception climbed from 63 to 83 in three years; the model's early +8 flag preceded a $56M extension and Team USA selection." },
      { take: "Can't carry a team offensively", rebuttal: "Peer-relative scoring tiers and playoff volume boost his impact even without All-Star voting — the gap was real in 2023-24, not a one-year blip." },
      { take: "Defense limits his ceiling", rebuttal: "Diamond score reflects total impact vs. public reputation, not a two-way ranking; Reaves was undervalued on offense and role, not miscast as a stopper." },
    ],
  },
  "payton-pritchard": {
    id: "payton-pritchard",
    name: "Payton Pritchard",
    team: "BOS",
    pos: "PG",
    tagline: "Late first-round sixth man — steady climb as recognition catches up to winning minutes",
    stats: [
      { label: "Draft slot", value: "26th" },
      { label: "2024-25 diamond", value: "+2" },
      { label: "2025-26 impact", value: "75" },
      { label: "2025-26 perception", value: "73" },
      { label: "Sixth Man", value: "2024-25" },
    ],
    doubts: [
      { take: "Backup guard on a stacked team", rebuttal: "28+ MPG and 45+ GP seasons with 70+ impact — the formula treats established rotation minutes as signal, not noise." },
      { take: "Sixth Man award means he's already recognized", rebuttal: "Perception moved from 64 to 73, but impact still leads — a small +2 diamond, not a polished star." },
      { take: "26th pick isn't a hidden gem", rebuttal: "Late first-round draft lag fades for age-28+ rotation players; Pritchard's arc is about sustained impact vs. still-lagging national profile." },
    ],
  },
  brunson: {
    id: "brunson",
    name: "Jalen Brunson",
    team: "NYK",
    pos: "PG",
    tagline: "Second-round pick with a multi-year diamond gap — perception rising, impact still ahead",
    stats: [
      { label: "Draft slot", value: "33rd" },
      { label: "Peak diamond", value: "+12" },
      { label: "2023-24 impact", value: "92" },
      { label: "2023-24 perception", value: "84" },
      { label: "2025-26 diamond", value: "+6" },
      { label: "Clutch POY", value: "2024-25" },
    ],
    doubts: [
      { take: "He's already an All-NBA star — not undervalued", rebuttal: "Perception reached 84 in 2023-24 but impact was 92; the gap narrowed to +6, not zero — still a diamond, not Fool's Gold." },
      { take: "Knicks hype inflated his reputation", rebuttal: "Playoff scoring volume and clutch recognition boost perception, but the formula still finds 6–12 point gaps across four straight seasons." },
      { take: "Second-round narrative is stale", rebuttal: "Draft-slot lag decays with age and minutes; Brunson's remaining gap is about elite impact (88–92) vs. very high but not matching perception." },
      { take: "Too high usage / not efficient enough", rebuttal: "Peer-relative scoring tiers and playoff boosts reward primary creation; impact reflects role burden, not Twitter efficiency takes." },
    ],
  },
  maxey: {
    id: "maxey",
    name: "Tyrese Maxey",
    team: "PHI",
    pos: "PG",
    tagline: "30th pick with sustained +8–9 diamond seasons as a franchise scoring guard",
    stats: [
      { label: "Draft slot", value: "30th" },
      { label: "Peak diamond", value: "+9" },
      { label: "2023-24 impact", value: "87" },
      { label: "2025-26 impact", value: "92" },
      { label: "2025-26 diamond", value: "+8" },
    ],
    doubts: [
      { take: "All-Star = fully recognized now", rebuttal: "Impact hit 92 in 2025-26 with perception at 84 — still +8; stardom and undervaluation can coexist in the formula." },
      { take: "30th pick breakout was years ago", rebuttal: "Draft lag persists for young stars with elite impact growth; Maxey keeps outpacing perception as his scoring load increases." },
    ],
  },
  mobley: {
    id: "mobley",
    name: "Evan Mobley",
    team: "CLE",
    pos: "PF",
    tagline: "Defensive anchor — the model now recognizes rim protection instead of punishing him as Fool's Gold",
    stats: [
      { label: "Draft slot", value: "3rd" },
      { label: "2024-25 impact", value: "85" },
      { label: "2024-25 perception", value: "84" },
      { label: "2024-25 diamond", value: "+1" },
      { label: "2025-26 alignment", value: "85/85" },
    ],
    doubts: [
      { take: "Third pick can't be a diamond", rebuttal: "Lottery pedigree caps extreme gaps for young defensive bigs, but peer-relative defense tiers prevent the old Fool's Gold misreads." },
      { take: "Offense is too limited for elite impact", rebuttal: "Rim protection, rebounding, and stocks score through position peer percentiles — not wing scoring proxies." },
      { take: "He was always properly rated", rebuttal: "Earlier formulas over-penalized defensive specialists; Mobley now sits near alignment (+1) rather than a false +24 hidden gem." },
    ],
  },
  "isaiah-hartenstein": {
    id: "isaiah-hartenstein",
    name: "Isaiah Hartenstein",
    team: "NYK",
    pos: "C",
    tagline: "Undrafted center with back-to-back +8–12 diamond seasons as an on/off anchor",
    stats: [
      { label: "Draft slot", value: "Undrafted" },
      { label: "Peak diamond", value: "+12" },
      { label: "2024-25 impact", value: "76" },
      { label: "2024-25 perception", value: "64" },
      { label: "2025-26 diamond", value: "+8" },
    ],
    doubts: [
      { take: "Backup center on a contender", rebuttal: "Starter-level minutes and rebounding anchor impact in New York — undrafted path keeps perception lagging behind box-score role value." },
      { take: "Empty stats big", rebuttal: "Peer-relative rebounding, screen-assist value via box score, and defensive stocks drive impact; national awards ignore this archetype." },
    ],
  },
};
