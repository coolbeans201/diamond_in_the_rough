import { describe, expect, it } from "vitest";
import { PLAYERS } from "@/data/players";
import { filterSeasonPlayers, getRankings, isEligible, RANKING_LIMIT } from "@/lib/scoring";
import { SEASONS } from "@/lib/types";

describe("season coverage", () => {
  for (const season of SEASONS) {
    it(`${season} has ${RANKING_LIMIT} diamonds and ${RANKING_LIMIT} fool's gold`, () => {
      const pool = filterSeasonPlayers(PLAYERS, season, "All");
      const { diamonds, foolGold } = getRankings(pool);
      expect(pool.length).toBeGreaterThanOrEqual(80);
      expect(diamonds.length).toBe(RANKING_LIMIT);
      expect(foolGold.length).toBe(RANKING_LIMIT);
    });
  }
});

describe("isEligible", () => {
  it("excludes season-long injuries", () => {
    expect(
      isEligible({
        season: "2025-26",
        id: "lillard",
        name: "Damian Lillard",
        team: "MIL",
        pos: "PG",
        impact: 56,
        perception: 82,
        highlight: "Achilles",
        confidence: "Low",
        rsGp: 12,
        mpg: 18,
        playoffGp: 0,
        scoreSource: "curated",
        seasonLongInjury: true,
      }),
    ).toBe(false);
  });

  it("excludes Haliburton from 2025-26 entirely", () => {
    const hali = PLAYERS.find((p) => p.id === "haliburton" && p.season === "2025-26");
    expect(hali).toBeUndefined();
  });
});

describe("getRankings foolGold", () => {
  it("only includes players with negative diamond scores", () => {
    const players = filterSeasonPlayers(PLAYERS, "2025-26", "All");
    const { foolGold } = getRankings(players);
    expect(foolGold.length).toBeGreaterThan(0);
    for (const p of foolGold) {
      expect(p.diamond).toBeLessThan(0);
    }
  });

  it("never pads foolGold with positive scores", () => {
    const players = filterSeasonPlayers(PLAYERS, "2024-25", "All");
    const { foolGold } = getRankings(players);
    for (const p of foolGold) {
      expect(p.perception).toBeGreaterThan(p.impact);
    }
  });
});

describe("Brunson validation", () => {
  it("ranks as top diamond in 2024-25", () => {
    const players = filterSeasonPlayers(PLAYERS, "2024-25", "All");
    const { diamonds } = getRankings(players);
    expect(diamonds[0]?.id).toBe("brunson");
    expect(diamonds[0]?.diamond).toBeGreaterThanOrEqual(20);
  });
});

describe("Anthony Edwards scoring continuity", () => {
  it("stays a diamond, not Fool's Gold, with stable scores across seasons", () => {
    const seasons = PLAYERS.filter((p) => p.id === "edwards").sort((a, b) =>
      a.season.localeCompare(b.season),
    );
    expect(seasons.length).toBeGreaterThanOrEqual(4);

    const recent = seasons.filter((p) => p.season >= "2023-24");
    for (const p of recent) {
      expect(p.impact).toBeGreaterThanOrEqual(80);
      expect(p.perception).toBeLessThanOrEqual(p.impact + 2);
      expect(p.impact - p.perception).toBeGreaterThan(0);
    }

    const pool = filterSeasonPlayers(PLAYERS, "2024-25", "All");
    const { foolGold } = getRankings(pool);
    expect(foolGold.some((p) => p.id === "edwards")).toBe(false);
  });
});
