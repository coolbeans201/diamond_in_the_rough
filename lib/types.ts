export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type Confidence = "High" | "Medium" | "Low";

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
  rsGp: number;
  mpg: number;
  playoffGp: number;
  seasonLongInjury?: boolean;
};

/** Featured-player metadata: highlights, confidence, injury flags. Scores come from the formula. */
export type CuratedPlayerSeason = {
  season: string;
  id: string;
  name: string;
  team: string;
  pos: Position;
  highlight: string;
  confidence: Confidence;
  rsGp: number;
  mpg: number;
  playoffGp: number;
  seasonLongInjury?: boolean;
};

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

export const POSITIONS: Array<Position | "All"> = [
  "All",
  "PG",
  "SG",
  "SF",
  "PF",
  "C",
];
