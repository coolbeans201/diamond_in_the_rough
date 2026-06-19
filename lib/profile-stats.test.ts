import { describe, expect, it } from "vitest";
import { buildPlayerSummaryStats } from "./profile-stats";
import type { ScoredPlayer } from "./types";

const sample: ScoredPlayer[] = [
  {
    season: "2025-26",
    id: "reaves",
    name: "Austin Reaves",
    team: "LAL",
    pos: "SG",
    impact: 82,
    perception: 83,
    diamond: -1,
    highlight: "",
    confidence: "High",
    rsGp: 70,
    mpg: 32,
    playoffGp: 10,
  },
  {
    season: "2023-24",
    id: "reaves",
    name: "Austin Reaves",
    team: "LAL",
    pos: "SG",
    impact: 71,
    perception: 63,
    diamond: 8,
    highlight: "",
    confidence: "High",
    rsGp: 68,
    mpg: 30,
    playoffGp: 8,
  },
];

describe("buildPlayerSummaryStats", () => {
  it("uses latest season for current scores and peak for max diamond", () => {
    const stats = buildPlayerSummaryStats(sample);
    expect(stats.find((s) => s.label === "Peak diamond")).toMatchObject({
      value: "+8",
      detail: "2023-24",
      tone: "diamond",
    });
    expect(stats.find((s) => s.label === "Impact")).toMatchObject({
      value: "82",
      detail: "2025-26",
    });
    expect(stats.find((s) => s.label === "Diamond")).toMatchObject({
      value: "-1",
      tone: "gold",
    });
  });
});
