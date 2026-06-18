export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type Confidence = "High" | "Medium" | "Low";
export type ScoreSource = "curated" | "estimated";

export type PlayerSeason = {
  season: string;
  id: string;
  name: string;
  team: string;
  pos: Position;
  impact: number;
  perception: number;
  highlight: string;
  confidence: Confidence;
  scoreSource: ScoreSource;
  rsGp: number;
  mpg: number;
  playoffGp: number;
  seasonLongInjury?: boolean;
};

/** Hand-tuned rows before scoreSource is applied at merge time. */
export type CuratedPlayerSeason = Omit<PlayerSeason, "scoreSource">;

export type ScoredPlayer = PlayerSeason & {
  diamond: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  team: string;
  pos: Position;
  tagline: string;
  stats: Array<{ label: string; value: string }>;
  doubts?: Array<{ take: string; rebuttal: string }>;
};

export type HallEntry = {
  name: string;
  id: string;
  seasons: string;
  outcome: string;
  peakDiamond: number;
};

export const SEASONS = [
  "2016-17",
  "2017-18",
  "2018-19",
  "2019-20",
  "2020-21",
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
] as const;

export type Season = (typeof SEASONS)[number];

/** Season with speculative curated narrative overlays (stats are still a static snapshot). */
export const SPECULATIVE_SEASON: Season = "2025-26";

export const POSITIONS: Array<Position | "All"> = [
  "All",
  "PG",
  "SG",
  "SF",
  "PF",
  "C",
];
