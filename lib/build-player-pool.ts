import type { CuratedPlayerSeason, PlayerSeason } from "./types";
import { SEASONS } from "./types";
import {
  computeImpact,
  computePerception,
  defaultConfidence,
  defaultHighlight,
  type ScoreInput,
} from "./compute-scores";
import {
  collectPositionPeerBaselines,
  resolvePeerContext,
} from "./peer-context";
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

function indexFeatured(entries: CuratedPlayerSeason[]): Map<string, CuratedPlayerSeason> {
  const map = new Map<string, CuratedPlayerSeason>();
  for (const entry of entries) {
    map.set(`${entry.season}:${normalizeName(entry.name)}`, entry);
  }
  return map;
}

function buildNameToId(entries: CuratedPlayerSeason[]): Map<string, string> {
  const map = new Map<string, string>(Object.entries(CANONICAL_PLAYER_IDS));
  const sorted = [...entries].sort((a, b) => b.season.localeCompare(a.season));
  for (const entry of sorted) {
    const key = normalizeName(entry.name);
    if (!map.has(key)) map.set(key, entry.id);
  }
  return map;
}

function scoreInput(raw: RawEligiblePlayer): ScoreInput {
  return { ...raw.box, playoffGp: raw.playoffGp };
}

function scorePlayer(raw: RawEligiblePlayer, seasonPeers: ReturnType<typeof collectPositionPeerBaselines>) {
  const input = scoreInput(raw);
  const peer = resolvePeerContext(raw.box, raw.pos, seasonPeers);
  const ctx = peer ? { peer } : undefined;
  const impact = computeImpact(input, ctx);
  const perception = computePerception(input, impact, ctx);
  return { impact, perception };
}

function fromGenerated(
  raw: RawEligiblePlayer,
  featured: CuratedPlayerSeason | undefined,
  stableId: string,
  seasonPeers: ReturnType<typeof collectPositionPeerBaselines>,
): PlayerSeason {
  const { impact, perception } = scorePlayer(raw, seasonPeers);

  const player: PlayerSeason = {
    season: raw.season,
    id: stableId,
    name: raw.name,
    team: raw.team,
    pos: featured?.pos ?? raw.pos,
    impact,
    perception,
    highlight: featured?.highlight ?? defaultHighlight(raw.box),
    confidence: featured?.confidence ?? defaultConfidence(raw.rsGp),
    rsGp: raw.rsGp,
    mpg: raw.mpg,
    playoffGp: raw.playoffGp,
  };

  if (featured?.seasonLongInjury) player.seasonLongInjury = true;
  return player;
}

/**
 * Build the full player pool:
 * 1. Every eligible NBA player from generated-pool.json (stats.nba.com snapshot)
 * 2. Impact and perception from the unified box-score formula for all players
 * 3. Featured entry files supply highlights, confidence, and injury flags only
 * 4. Per-season position peer baselines calibrate defense and volume tiers
 */
export function buildPlayerPool(featuredEntries: CuratedPlayerSeason[]): PlayerSeason[] {
  const featured = indexFeatured(featuredEntries);
  const nameToId = buildNameToId(featuredEntries);
  const players: PlayerSeason[] = [];
  const seen = new Set<string>();

  for (const season of SEASONS) {
    const rawSeason = poolFile.seasons[season] ?? [];
    const seasonPeers = collectPositionPeerBaselines(
      rawSeason.map((raw) => ({ pos: raw.pos, box: raw.box })),
    );

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

      const draft = fromGenerated(raw, featured.get(`${season}:${nameKey}`), stableId, seasonPeers);
      if (isEligible(draft)) {
        players.push(draft);
      }
    }
  }

  return players;
}

export const POOL_GENERATED_AT = poolFile.generatedAt;
