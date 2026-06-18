import { describe, expect, it } from "vitest";
import {
  collectPositionPeerBaselines,
  percentileRank,
  resolvePeerContext,
} from "./peer-context";

describe("peer-context", () => {
  it("percentileRank returns expected rank within a sample", () => {
    expect(percentileRank(10, [5, 10, 15])).toBe(33);
    expect(percentileRank(15, [5, 10, 15])).toBe(67);
    expect(percentileRank(20, [5, 10, 15])).toBe(100);
  });

  it("resolvePeerContext compares within position, not across positions", () => {
    const centerBox = sampleBox(12, 14, 1, 0.7, 3.0);
    const guardBox = sampleBox(20, 4, 5, 1.8, 0.4);
    const baselines = collectPositionPeerBaselines([
      ...Array.from({ length: 6 }, (_, i) => ({
        pos: "C" as const,
        box: sampleBox(10 + i, 12 + i * 0.5, 1, 0.5, 2 + i * 0.2),
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        pos: "SG" as const,
        box: sampleBox(16 + i, 4, 4 + i * 0.3, 1.2 + i * 0.1, 0.3),
      })),
    ]);

    const center = resolvePeerContext(centerBox, "C", baselines);
    const guard = resolvePeerContext(guardBox, "SG", baselines);

    expect(center).toBeDefined();
    expect(guard).toBeDefined();
    expect(center!.blkPct).toBeGreaterThanOrEqual(50);
    expect(guard!.stlPct).toBeGreaterThanOrEqual(50);
    expect(centerBox.blk).toBeGreaterThan(guardBox.blk);
    expect(guardBox.stl).toBeGreaterThan(centerBox.stl);
  });
});

function sampleBox(
  pts: number,
  reb: number,
  ast: number,
  stl: number,
  blk: number,
) {
  return {
    pts,
    reb,
    ast,
    stl,
    blk,
    mpg: 30,
    gp: 70,
    plusMinus: 2,
    age: 26,
    draftPick: 15,
  };
}
