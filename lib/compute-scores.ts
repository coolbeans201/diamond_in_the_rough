import type { Confidence, Position } from "./types";

export type BoxStats = {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  mpg: number;
  gp: number;
  plusMinus: number;
  age: number;
  draftPick: number | null;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Rough position guess when the API does not expose one. */
export function inferPosition(stats: BoxStats, heightInches = 78): Position {
  const { pts, reb, ast } = stats;
  if (heightInches >= 84 && reb >= 6) return "C";
  if (heightInches >= 81 && reb >= 7) return "PF";
  if (ast >= 6) return "PG";
  if (ast >= 4 && pts >= 14) return "SG";
  if (reb >= 7) return "PF";
  return "SF";
}

/** Shared production model — calibrated to curated scores for ~26 PPG stars. */
function productionScore(stats: BoxStats): number {
  const production =
    stats.pts * 1.25 +
    stats.reb * 0.85 +
    stats.ast * 1.1 +
    stats.stl * 1.6 +
    stats.blk * 1.6;
  const durability = stats.gp >= 65 ? 3 : stats.gp >= 50 ? 1 : 0;
  return 36 + production + stats.plusMinus * 0.55 + durability;
}

/**
 * Baseline impact from box score + plus-minus.
 * Curated overrides replace this for featured players.
 */
export function computeImpact(stats: BoxStats): number {
  return clamp(productionScore(stats), 35, 92);
}

/**
 * Baseline perception tracks impact with small pedigree/age adjustments.
 * Large overvaluation gaps (Fool's Gold) come from curated scores, not heuristics.
 */
export function computePerception(stats: BoxStats): number {
  const impact = productionScore(stats);
  const draftBoost =
    stats.draftPick === null
      ? 0
      : stats.draftPick <= 3
        ? 4
        : stats.draftPick <= 10
          ? 2
          : 0;
  // Young stars: production leads hype. Older vets: reputation can outrun current impact.
  const ageSkew =
    stats.age <= 25 ? -7 : stats.age >= 32 ? 7 : stats.age >= 30 ? 4 : 0;
  return clamp(impact + draftBoost + ageSkew, 35, 92);
}

export function defaultHighlight(stats: BoxStats): string {
  return `${stats.pts.toFixed(1)} PPG, ${stats.ast.toFixed(1)} APG, ${stats.plusMinus >= 0 ? "+" : ""}${stats.plusMinus.toFixed(1)} +/-`;
}

export function defaultConfidence(gp: number): Confidence {
  if (gp >= 60) return "High";
  if (gp >= 45) return "Medium";
  return "Low";
}
