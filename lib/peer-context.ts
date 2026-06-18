import type { BoxStats } from "./compute-scores";
import type { Position } from "./types";

export type PositionPeerBaselines = {
  pts: number[];
  reb: number[];
  ast: number[];
  stl: number[];
  blk: number[];
  stocks: number[];
  plusMinus: number[];
};

export type PeerContext = {
  ptsPct: number;
  rebPct: number;
  astPct: number;
  stlPct: number;
  blkPct: number;
  stocksPct: number;
  plusMinusPct: number;
  /** Position-relative defensive profile (0–100). */
  defensePct: number;
};

export type ScoringContext = {
  peer?: PeerContext;
};

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

/** Percentile rank of `value` within a peer sample (0–100). */
export function percentileRank(value: number, sample: number[]): number {
  if (sample.length === 0) return 50;
  if (sample.length === 1) return value >= sample[0]! ? 100 : 0;

  const sorted = [...sample].sort((a, b) => a - b);
  let below = 0;
  for (const v of sorted) {
    if (v < value) below++;
  }
  return Math.round((below / sorted.length) * 100);
}

export function collectPositionPeerBaselines(
  players: Array<{ pos: Position; box: BoxStats }>,
): Map<Position, PositionPeerBaselines> {
  const grouped = new Map<Position, BoxStats[]>();

  for (const pos of POSITIONS) grouped.set(pos, []);

  for (const player of players) {
    grouped.get(player.pos)?.push(player.box);
  }

  const baselines = new Map<Position, PositionPeerBaselines>();

  for (const [pos, boxes] of grouped) {
    if (boxes.length === 0) continue;

    baselines.set(pos, {
      pts: boxes.map((b) => b.pts),
      reb: boxes.map((b) => b.reb),
      ast: boxes.map((b) => b.ast),
      stl: boxes.map((b) => b.stl),
      blk: boxes.map((b) => b.blk),
      stocks: boxes.map((b) => b.stl + b.blk),
      plusMinus: boxes.map((b) => b.plusMinus),
    });
  }

  return baselines;
}

export function resolvePeerContext(
  stats: BoxStats,
  pos: Position,
  baselines: Map<Position, PositionPeerBaselines>,
): PeerContext | undefined {
  const sample = baselines.get(pos);
  if (!sample || sample.pts.length < 6) return undefined;

  const stocks = stats.stl + stats.blk;
  const ptsPct = percentileRank(stats.pts, sample.pts);
  const rebPct = percentileRank(stats.reb, sample.reb);
  const astPct = percentileRank(stats.ast, sample.ast);
  const stlPct = percentileRank(stats.stl, sample.stl);
  const blkPct = percentileRank(stats.blk, sample.blk);
  const stocksPct = percentileRank(stocks, sample.stocks);
  const plusMinusPct = percentileRank(stats.plusMinus, sample.plusMinus);
  const defensePct = Math.round((stlPct + blkPct + stocksPct) / 3);

  return {
    ptsPct,
    rebPct,
    astPct,
    stlPct,
    blkPct,
    stocksPct,
    plusMinusPct,
    defensePct,
  };
}
