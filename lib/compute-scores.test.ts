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
    draftPick: 5,
    playoffGp: 15,
  };

  it("rates young stars as diamonds, not fool's gold", () => {
    const impact = computeImpact(ant2024);
    const perception = computePerception(ant2024, impact);
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
      playoffGp: 0,
    };
    const impact = computeImpact(westbrook);
    const perception = computePerception(westbrook, impact);
    expect(perception).toBeGreaterThan(impact);
  });

  it("skips unknown-prospect discount for top-3 lottery picks", () => {
    const edwardsRookie = {
      pts: 19.3,
      reb: 4.7,
      ast: 2.9,
      stl: 1.1,
      blk: 0.5,
      mpg: 32.1,
      gp: 72,
      plusMinus: -3.2,
      age: 19,
      draftPick: 1,
      playoffGp: 0,
    };
    const impact = computeImpact(edwardsRookie);
    const perception = computePerception(edwardsRookie, impact);
    expect(impact - perception).toBeLessThanOrEqual(6);
  });

  it("caps end-of-line scoring reputation for low-output veterans", () => {
    const melo = {
      pts: 13.3,
      reb: 4.2,
      ast: 0.9,
      stl: 0.7,
      blk: 0.4,
      mpg: 26.0,
      gp: 69,
      plusMinus: -1.2,
      age: 37,
      draftPick: 3,
      playoffGp: 0,
    };
    const impact = computeImpact(melo);
    const perception = computePerception(melo, impact);
    expect(perception).toBeLessThanOrEqual(impact + 8);
  });
});
