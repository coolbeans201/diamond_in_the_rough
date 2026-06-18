import type { PeerContext, ScoringContext } from "./peer-context";
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

export type ScoreInput = BoxStats & {
  playoffGp?: number;
};

export type { PeerContext, ScoringContext };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function hasPeer(peer?: PeerContext): peer is PeerContext {
  return peer != null;
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

/** Box-score production index — shared by impact and perception baselines. */
export function productionScore(stats: BoxStats): number {
  const production =
    stats.pts * 1.25 +
    stats.reb * 0.85 +
    stats.ast * 1.1 +
    stats.stl * 1.6 +
    stats.blk * 1.6;
  const durability = stats.gp >= 65 ? 3 : stats.gp >= 50 ? 1 : 0;
  return 36 + production + stats.plusMinus * 0.55 + durability;
}

function playoffBoost(playoffGp: number): number {
  if (playoffGp >= 20) return 5;
  if (playoffGp >= 12) return 3;
  if (playoffGp >= 4) return 1;
  return 0;
}

/** Boost impact when peer-relative defense and plus-minus signal hidden value. */
function defenseBonus(stats: BoxStats, peer?: PeerContext): number {
  let bonus = 0;
  const stocks = stats.stl + stats.blk;

  if (hasPeer(peer)) {
    if (peer.blkPct >= 80 && peer.rebPct >= 70) bonus += 3;
    else if (peer.blkPct >= 65 && peer.rebPct >= 55) bonus += 2;

    if (peer.stlPct >= 85 && stats.plusMinus >= 0) bonus += 3;
    else if (peer.stlPct >= 70 && stats.plusMinus >= 1) bonus += 2;
    else if (peer.stlPct >= 60 && stats.plusMinus >= 2.5 && peer.ptsPct <= 40) bonus += 3;

    if (peer.ptsPct <= 35 && peer.defensePct >= 70 && stats.mpg >= 18 && stats.plusMinus >= 0) bonus += 3;
    if (peer.ptsPct <= 30 && stats.plusMinus >= 3 && peer.stlPct >= 55) bonus += 2;
  } else {
    if (stats.blk >= 1.5 && stats.reb >= 8) bonus += 3;
    else if (stats.blk >= 1.2 && stats.reb >= 7) bonus += 2;

    if (stats.stl >= 1.4 && stats.plusMinus >= 0) bonus += 3;
    else if (stats.stl >= 1.2 && stats.plusMinus >= 1) bonus += 2;
    else if (stats.stl >= 1.0 && stats.plusMinus >= 2.5 && stats.pts < 12) bonus += 3;

    if (stats.pts < 12 && stats.mpg >= 18 && stocks >= 1.4 && stats.plusMinus >= 0) bonus += 3;
    if (stats.pts < 10 && stats.plusMinus >= 3 && stats.stl >= 1.0) bonus += 2;
  }

  return Math.min(bonus, 8);
}

/**
 * Impact from box score, plus-minus, durability, defense, and a small playoff sample boost.
 */
export function computeImpact(stats: ScoreInput, ctx?: ScoringContext): number {
  const raw =
    productionScore(stats) +
    playoffBoost(stats.playoffGp ?? 0) +
    defenseBonus(stats, ctx?.peer);
  return clamp(raw, 35, 92);
}

function scoringVolumeTier(stats: BoxStats, peer?: PeerContext): number {
  if (hasPeer(peer)) {
    if (peer.ptsPct >= 95) return 3;
    if (peer.ptsPct >= 85) return 2;
    if (peer.ptsPct >= 70) return 1;
    return 0;
  }
  if (stats.pts >= 28) return 3;
  if (stats.pts >= 24) return 2;
  if (stats.pts >= 20) return 1;
  return 0;
}

function isLowScoring(stats: BoxStats, peer?: PeerContext): boolean {
  return hasPeer(peer) ? peer.ptsPct <= 40 : stats.pts < 14;
}

function isModerateScoring(stats: BoxStats, peer?: PeerContext): boolean {
  return hasPeer(peer) ? peer.ptsPct <= 55 : stats.pts < 18;
}

function isHubStar(stats: BoxStats, peer?: PeerContext): boolean {
  return hasPeer(peer)
    ? peer.astPct >= 88 || peer.rebPct >= 92
    : stats.ast >= 8 || stats.reb >= 10;
}

function isPassingBig(stats: BoxStats, peer?: PeerContext): boolean {
  return hasPeer(peer)
    ? (peer.rebPct >= 75 && peer.astPct >= 82) ||
        (peer.astPct >= 85 && peer.rebPct >= 50)
    : stats.reb >= 9 && stats.ast >= 6.5;
}

function isRimAnchor(stats: BoxStats, peer?: PeerContext): boolean {
  return hasPeer(peer)
    ? peer.blkPct >= 65 && peer.rebPct >= 65
    : stats.blk >= 1.4 && stats.reb >= 9;
}

function isEliteRimAnchor(stats: BoxStats, peer?: PeerContext): boolean {
  if (stats.blk >= 2 && stats.reb >= 12) return true;
  return hasPeer(peer)
    ? peer.blkPct >= 78 && peer.rebPct >= 72
    : stats.blk >= 1.8 && stats.reb >= 10;
}

function isEliteDefender(stats: BoxStats, peer: PeerContext | undefined, imp: number): boolean {
  if (hasPeer(peer)) {
    return peer.defensePct >= 75 && peer.plusMinusPct >= 55 && imp >= 68;
  }
  const stocks = stats.stl + stats.blk;
  return stocks >= 1.8 && stats.plusMinus >= 0.5 && imp >= 68;
}

/**
 * Perception = impact adjusted for market reputation:
 * - Late-round breakouts: hype lags (diamonds)
 * - Top picks: nationally known, but can still trail elite production when young
 * - MVP hubs / established superstars: market catches up to elite two-way production
 * - Aging/low-output vets: legacy can outrun production (Fool's Gold)
 */
export function computePerception(
  stats: ScoreInput,
  impact?: number,
  ctx?: ScoringContext,
): number {
  const imp = impact ?? computeImpact(stats, ctx);
  const peer = ctx?.peer;

  const ppgTier = scoringVolumeTier(stats, peer);

  let pedigree = 0;
  if (stats.draftPick && stats.draftPick <= 3) pedigree = 4;
  else if (stats.draftPick && stats.draftPick <= 10) pedigree = 2;
  if (imp < 58) pedigree *= 0.25;
  else if (imp < 68) pedigree *= 0.5;

  const hubStar = isHubStar(stats, peer);
  const passingBig = isPassingBig(stats, peer);
  const rimAnchor = isRimAnchor(stats, peer);
  const eliteRimAnchor = isEliteRimAnchor(stats, peer);
  const stocks = stats.stl + stats.blk;

  const youngLotteryDefensiveBig =
    stats.draftPick &&
    stats.draftPick <= 5 &&
    rimAnchor &&
    stats.age <= 24 &&
    imp >= 72;

  const eliteDefender = isEliteDefender(stats, peer, imp);
  const recognizedDefender =
    !youngLotteryDefensiveBig &&
    ((eliteDefender && stats.age >= 26 && imp >= 72) ||
      (eliteDefender && stats.age >= 28 && imp >= 66 && ((stats.playoffGp ?? 0) >= 10 || stats.mpg >= 22)) ||
      (eliteRimAnchor && stats.age >= 24 && imp >= 74) ||
      (rimAnchor && stats.age >= 30 && imp >= 72));
  const hiddenDefensiveGem =
    eliteDefender &&
    isLowScoring(stats, peer) &&
    !recognizedDefender &&
    !(stats.draftPick && stats.draftPick <= 5 && stats.age <= 24 && imp >= 72);

  if (
    isModerateScoring(stats, peer) &&
    imp >= 72 &&
    (hasPeer(peer) ? peer.defensePct >= 65 : stocks >= 1.5) &&
    !recognizedDefender &&
    stats.draftPick &&
    stats.draftPick <= 5 &&
    stats.age <= 24
  ) {
    pedigree = Math.round(pedigree * 0.25);
  }

  let legacy = 0;
  if (stats.age >= 35) legacy = 4;
  else if (stats.age >= 32) legacy = 3;
  else if (stats.age >= 30) legacy = 1;
  if (imp < 55 || isLowScoring(stats, peer)) legacy *= 0.15;
  else if (imp < 62) legacy *= 0.4;

  const undraftedOrDeepLate = stats.draftPick == null || stats.draftPick > 30;
  const lateFirstRound =
    stats.draftPick != null && stats.draftPick > 15 && stats.draftPick <= 30;
  const latePick = undraftedOrDeepLate || lateFirstRound;
  const topPick = stats.draftPick === 1;
  const playoffGp = stats.playoffGp ?? 0;

  const establishedRotation =
    stats.age >= 26 && imp >= 72 && stats.mpg >= 28 && stats.gp >= 45;

  let marketLag = 0;

  if (latePick && imp >= 70) {
    let lag = 0;
    if (imp >= 82) lag = stats.age <= 29 ? 18 : 14;
    else if (imp >= 76) lag = stats.age <= 27 ? 12 : 9;
    else lag = 8;

    if (lateFirstRound && !undraftedOrDeepLate) lag = Math.round(lag * 0.55);

    const highVolumeScorer = hasPeer(peer) ? peer.ptsPct >= 75 : stats.pts >= 22;
    const starVolumeScorer = hasPeer(peer) ? peer.ptsPct >= 82 : stats.pts >= 24;

    if (stats.age >= 29 && imp >= 86 && starVolumeScorer && playoffGp >= 10) {
      lag = Math.round(lag * 0.33);
    } else if (stats.age >= 28 && imp >= 84 && highVolumeScorer && playoffGp >= 8) {
      lag = Math.round(lag * 0.55);
    } else if (stats.age >= 28 && imp >= 86 && playoffGp >= 10) {
      lag = Math.round(lag * 0.45);
    } else if (establishedRotation && stats.age >= 28 && imp >= 78 && stats.mpg >= 30) {
      lag = 0;
    } else if (establishedRotation && stats.age >= 27) {
      lag = Math.round(lag * 0.55);
    } else if (establishedRotation) {
      lag = Math.round(lag * 0.7);
    } else if (eliteRimAnchor && stats.age >= 24 && imp >= 72) {
      lag = 0;
    } else if (recognizedDefender && rimAnchor && stats.age >= 25 && imp >= 74) {
      lag = 0;
    } else if (recognizedDefender && rimAnchor && stats.age >= 30 && imp >= 72) {
      lag = Math.round(lag * 0.15);
    }

    marketLag -= lag;
  }

  if (topPick && imp >= 84 && stats.age <= 26) {
    marketLag -= stats.age <= 22 ? 8 : 10;
  } else if (topPick && imp >= 68 && stats.age <= 26) {
    marketLag -= stats.age <= 22 ? 4 : 7;
  }

  if (stats.draftPick && stats.draftPick > 3 && stats.draftPick <= 14 && imp >= 74 && stats.age <= 26) {
    marketLag -= 8;
  }

  if (hiddenDefensiveGem) {
    marketLag -= stats.plusMinus >= 2 ? 12 : 8;
  } else if (
    stats.draftPick &&
    stats.draftPick <= 5 &&
    rimAnchor &&
    stats.age <= 24 &&
    imp >= 72 &&
    isModerateScoring(stats, peer)
  ) {
    marketLag -= 3;
  } else if (eliteDefender && (hasPeer(peer) ? peer.ptsPct <= 60 : stats.pts < 16) && imp >= 72 && !recognizedDefender) {
    marketLag -= 5;
  }

  let raw = imp + ppgTier + pedigree + legacy + marketLag;

  const starScorer = hasPeer(peer) ? peer.ptsPct >= 90 : stats.pts >= 28;
  const highScorer = hasPeer(peer) ? peer.ptsPct >= 85 : stats.pts >= 26;
  const strongScorer = hasPeer(peer) ? peer.ptsPct >= 80 : stats.pts >= 24;
  const eliteRebounder = hasPeer(peer) ? peer.rebPct >= 90 : stats.reb >= 12;

  if (hubStar && imp >= 90 && starScorer && eliteRebounder) {
    raw = Math.max(raw, imp - 4);
  } else if (hubStar && imp >= 88 && highScorer) {
    raw = Math.max(raw, imp - 6);
  } else if (passingBig && imp >= 88 && (hasPeer(peer) ? peer.ptsPct >= 65 : stats.pts >= 18)) {
    raw = Math.max(raw, imp - 6);
  } else if (passingBig && imp >= 86) {
    raw = Math.max(raw, imp - 8);
  } else if (imp >= 88 && stats.age >= 26 && strongScorer && (!latePick || hubStar)) {
    raw = Math.max(raw, imp - 4);
  } else if (
    imp >= 86 &&
    stats.age >= 28 &&
    (hasPeer(peer) ? peer.ptsPct >= 75 : stats.pts >= 22) &&
    stats.draftPick &&
    stats.draftPick <= 15
  ) {
    raw = Math.max(raw, imp - 6);
  } else if (eliteRimAnchor && imp >= 72 && stats.age >= 24) {
    raw = Math.max(raw, imp - 4);
  } else if (recognizedDefender) {
    raw = Math.max(raw, imp - (imp >= 82 ? 4 : 6));
  } else if (imp >= 88 && stats.age >= 28 && strongScorer && playoffGp >= 8) {
    raw = Math.max(raw, imp - 4);
  } else if (establishedRotation && imp >= 74 && stats.age >= 28) {
    raw = Math.max(raw, imp - (imp >= 80 ? 6 : 8));
  }

  if (hiddenDefensiveGem && stats.plusMinus >= 2) {
    raw = Math.min(raw, imp - 6);
  }

  const highDraftStarScorer = hasPeer(peer) ? peer.ptsPct >= 70 : stats.pts >= 22;
  if (imp >= 80 && stats.age <= 30 && stats.draftPick && stats.draftPick <= 5 && highDraftStarScorer) {
    raw = Math.min(raw, imp + 2);
  } else if (imp >= 82 && stats.age <= 29 && stats.draftPick && stats.draftPick <= 5 && highDraftStarScorer) {
    raw = Math.min(raw, imp + 2);
  }

  const collapsedFormerStar =
    stats.age >= 28 &&
    stats.age < 35 &&
    imp < 62 &&
    stats.draftPick &&
    stats.draftPick <= 5 &&
    isLowScoring(stats, peer);

  if (collapsedFormerStar) {
    const repPremium = Math.min(9, Math.max(3, Math.round(64 - imp * 0.75)));
    raw += repPremium;
  }

  if (
    stats.age >= 32 &&
    stats.age < 36 &&
    imp < 68 &&
    isLowScoring(stats, peer) &&
    !recognizedDefender &&
    !eliteDefender
  ) {
    const ageDrift = stats.age >= 36 ? 4 : stats.age >= 34 ? 3 : 2;
    const outputFade = Math.max(0, Math.round((62 - imp) * 0.12));
    raw += ageDrift + outputFade;
  }

  if (
    stats.draftPick &&
    stats.draftPick <= 5 &&
    stats.age <= 24 &&
    imp >= 72 &&
    (rimAnchor || eliteDefender)
  ) {
    raw = Math.min(raw, imp);
  } else if (youngLotteryDefensiveBig) {
    raw = Math.min(raw, imp);
  } else if (recognizedDefender && isModerateScoring(stats, peer)) {
    raw = Math.min(raw, imp + 1);
  }
  if (isLowScoring(stats, peer) && stats.age >= 36) raw = Math.min(raw, imp + 2);
  if (stats.age >= 37 && (isLowScoring(stats, peer) || stats.pts < 15)) {
    raw = Math.min(raw, imp + 1);
  }
  if ((hasPeer(peer) ? peer.ptsPct <= 45 : stats.pts < 15) && stats.age >= 34) {
    raw = Math.min(raw, imp + 4);
  }

  return clamp(raw, 35, 92);
}

export function defaultHighlight(stats: BoxStats): string {
  return `${stats.pts.toFixed(1)} PPG, ${stats.ast.toFixed(1)} APG, ${stats.plusMinus >= 0 ? "+" : ""}${stats.plusMinus.toFixed(1)} +/-`;
}

export function defaultConfidence(gp: number): Confidence {
  if (gp >= 60) return "High";
  if (gp >= 45) return "Medium";
  return "Low";
}
