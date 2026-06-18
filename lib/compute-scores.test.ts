import { describe, expect, it } from "vitest";
import { computeImpact, computePerception } from "./compute-scores";

describe("compute-scores heuristics", () => {
  const ant2024 = {
    pts: 27.6,
    reb: 5.7,
    ast: 4.5,
    stl: 1.2,
    blk: 0.6,
    mpg: 36.3,
    gp: 79,
    plusMinus: 3.7,
    age: 23,
    draftPick: 1,
  };

  it("rates young stars as diamonds, not fool's gold", () => {
    const impact = computeImpact(ant2024);
    const perception = computePerception(ant2024);
    expect(impact).toBeGreaterThanOrEqual(80);
    expect(perception).toBeLessThanOrEqual(impact);
    expect(impact - perception).toBeGreaterThan(0);
  });

  it("allows older vets perception to exceed impact", () => {
    const westbrook = {
      pts: 15.2,
      reb: 5.4,
      ast: 7.3,
      stl: 1.0,
      blk: 0.4,
      mpg: 28.0,
      gp: 58,
      plusMinus: -2.0,
      age: 33,
      draftPick: 4,
    };
    const impact = computeImpact(westbrook);
    const perception = computePerception(westbrook);
    expect(perception).toBeGreaterThan(impact);
  });
});
