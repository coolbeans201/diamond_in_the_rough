import type { CuratedPlayerSeason, PlayerSeason } from "./types";
import { SEASONS } from "./types";
import {
  computeImpact,
  computePerception,
  defaultConfidence,
  defaultHighlight,
} from "./compute-scores";
import { normalizeName, slugFromName } from "./slug";
import { isEligible } from "./scoring";
import type { RawEligiblePlayer } from "./nba-api";
import generatedPool from "@/data/generated-pool.json";
import { CANONICAL_PLAYER_IDS } from "@/data/canonical-ids";

type GeneratedPoolFile = {
  generatedAt: string;
  seasons: Record<string, RawEligiblePlayer[]>;
};

const poolFile = generatedPool as GeneratedPoolFile;

/** Curated score overrides — keyed by season + normalized player name. */
function indexCurated(entries: CuratedPlayerSeason[]): Map<string, CuratedPlayerSeason> {
  const map = new Map<string, CuratedPlayerSeason>();
  for (const entry of entries) {
    map.set(`${entry.season}:${normalizeName(entry.name)}`, entry);
  }
  return map;
}

/** Stable slug — canonical map wins, else most recent curated id, else name slug. */
function buildNameToId(entries: CuratedPlayerSeason[]): Map<string, string> {
  const map = new Map<string, string>(Object.entries(CANONICAL_PLAYER_IDS));
  const sorted = [...entries].sort((a, b) => b.season.localeCompare(a.season));
  for (const entry of sorted) {
    const key = normalizeName(entry.name);
    if (!map.has(key)) map.set(key, entry.id);
  }
  return map;
}

function fromGenerated(
  raw: RawEligiblePlayer,
  curated: CuratedPlayerSeason | undefined,
  stableId: string,
): PlayerSeason {
  if (curated) {
    const merged = {
      ...curated,
      team: raw.team,
      rsGp: raw.rsGp,
      mpg: raw.mpg,
      playoffGp: raw.playoffGp,
    };
    if (curated.seasonLongInjury) merged.seasonLongInjury = true;
    return { ...merged, scoreSource: "curated" as const };
  }

  const impact = computeImpact(raw.box);
  const perception = computePerception(raw.box);
  return {
    season: raw.season,
    id: stableId,
    name: raw.name,
    team: raw.team,
    pos: raw.pos,
    impact,
    perception,
    highlight: defaultHighlight(raw.box),
    confidence: defaultConfidence(raw.rsGp),
    scoreSource: "estimated",
    rsGp: raw.rsGp,
    mpg: raw.mpg,
    playoffGp: raw.playoffGp,
  };
}

/**
 * Build the full player pool:
 * 1. Every eligible NBA player from generated-pool.json (stats.nba.com snapshot)
 * 2. Curated impact/perception overlays when a matching hand-tuned row exists
 *
 * Curated rows never add players on their own — they only tune scores for
 * players already in the generated eligibility base.
 */
export function buildPlayerPool(curatedEntries: CuratedPlayerSeason[]): PlayerSeason[] {
  const curated = indexCurated(curatedEntries);
  const nameToId = buildNameToId(curatedEntries);
  const players: PlayerSeason[] = [];
  const seen = new Set<string>();

  for (const season of SEASONS) {
    const rawSeason = poolFile.seasons[season] ?? [];
    for (const raw of rawSeason) {
      const nameKey = normalizeName(raw.name);
      const stableId = nameToId.get(nameKey) ?? slugFromName(raw.name);
      const uniqueKey = `${season}:${stableId}`;
      if (seen.has(uniqueKey)) {
        throw new Error(
          `Duplicate pool key ${uniqueKey} — ${raw.name} collides with another player's id`,
        );
      }
      seen.add(uniqueKey);

      const draft = fromGenerated(
        raw,
        curated.get(`${season}:${nameKey}`),
        stableId,
      );
      if (isEligible(draft)) {
        players.push(draft);
      }
    }
  }

  return players;
}

export const POOL_GENERATED_AT = poolFile.generatedAt;
