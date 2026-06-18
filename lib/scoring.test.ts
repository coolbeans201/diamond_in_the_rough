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

  it("foolGold gaps vary — not a flat perception floor", () => {
    const players = filterSeasonPlayers(PLAYERS, "2024-25", "All");
    const { foolGold } = getRankings(players);
    const gaps = new Set(foolGold.map((p) => p.diamond));
    expect(gaps.size).toBeGreaterThan(1);
    const gapCounts = new Map<number, number>();
    for (const p of foolGold) {
      gapCounts.set(p.diamond, (gapCounts.get(p.diamond) ?? 0) + 1);
    }
    const maxSameGap = Math.max(...gapCounts.values());
    expect(maxSameGap).toBeLessThan(foolGold.length);
  });
});

describe("Brunson validation", () => {
  it("2023-24 still shows a diamond gap before full All-Star recognition", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2023-24", "All");
    const brunson = pool.find((p) => p.id === "brunson");
    expect(brunson?.diamond).toBeGreaterThanOrEqual(6);
    expect(brunson?.perception).toBeLessThan(brunson!.impact);
  });

  it("2024-25 perception reflects rising All-Star recognition with a smaller gap", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2023-24", "All");
    const brunson2324 = pool.find((p) => p.id === "brunson");
    expect(brunson2324?.perception).toBeGreaterThanOrEqual(68);
    expect(brunson2324?.diamond).toBeGreaterThan(5);

    const pool2526 = filterSeasonPlayers(PLAYERS, "2024-25", "All");
    const brunson2425 = pool2526.find((p) => p.id === "brunson");
    expect(brunson2425?.perception).toBeGreaterThanOrEqual(78);
    expect(brunson2425!.impact - brunson2425!.perception).toBeLessThan(
      brunson2324!.impact - brunson2324!.perception,
    );
  });
});

describe("perception calibration", () => {
  it("melo 2021-22 perception fits end-of-line sixth-man role", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2021-22", "All");
    const melo = pool.find((p) => p.id === "melo");
    expect(melo?.perception).toBeLessThanOrEqual(66);
    expect(melo?.diamond).toBeLessThanOrEqual(0);
  });

  it("simmons 2022-23 is not #1 fool's gold on stale All-Star reputation", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2022-23", "All");
    const simmons = pool.find((p) => p.id === "simmons");
    expect(simmons?.rsGp).toBeGreaterThanOrEqual(40);
    const { foolGold } = getRankings(pool);
    expect(foolGold[0]?.id).not.toBe("simmons");
  });
});

describe("MVP perception", () => {
  it("Jokic 2024-25 reflects top-tier market recognition, not a hidden gem", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2024-25", "All");
    const jokic = pool.find((p) => p.id === "jokic");
    expect(jokic?.perception).toBeGreaterThanOrEqual(86);
    const { diamonds } = getRankings(pool);
    expect(diamonds.some((p) => p.id === "jokic")).toBe(false);
  });

  it("Jokic 2018-19 reflects All-NBA hub recognition despite sub-26 PPG", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2018-19", "All");
    const jokic = pool.find((p) => p.id === "jokic");
    expect(jokic?.perception).toBeGreaterThanOrEqual(84);
    expect(jokic?.impact).toBeGreaterThanOrEqual(88);
    expect(jokic!.impact - jokic!.perception).toBeLessThanOrEqual(8);
  });

  it("Jokic 2019-20 reflects second All-NBA first team season", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2019-20", "All");
    const jokic = pool.find((p) => p.id === "jokic");
    expect(jokic?.perception).toBeGreaterThanOrEqual(82);
  });
});

describe("SGA pre-MVP recognition", () => {
  it("2022-23 perception reflects All-NBA star, not an unknown", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2022-23", "All");
    const sga = pool.find((p) => p.id === "sga");
    expect(sga?.perception).toBeGreaterThanOrEqual(70);
    expect(sga?.impact).toBeGreaterThanOrEqual(78);
  });

  it("2023-24 perception tracks MVP-runner-up status before the MVP season", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2023-24", "All");
    const sga = pool.find((p) => p.id === "sga");
    expect(sga?.perception).toBeGreaterThanOrEqual(74);
  });
});

describe("Anthony Edwards rookie season", () => {
  it("2020-21 reflects No. 1 pick recognition, not a hidden prospect", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2020-21", "All");
    const edwards = pool.find((p) => p.id === "edwards");
    expect(edwards?.perception).toBeGreaterThanOrEqual(66);
    expect(edwards!.impact - edwards!.perception).toBeLessThanOrEqual(6);
  });
});

describe("established star perception", () => {
  it("Brunson 2025-26 reflects multi-time All-Star recognition", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2025-26", "All");
    const brunson = pool.find((p) => p.id === "brunson");
    expect(brunson?.perception).toBeGreaterThanOrEqual(80);
    expect(brunson?.impact).toBeGreaterThanOrEqual(86);
  });

  it("Giannis 2018-19 reflects reigning MVP-tier recognition", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2018-19", "All");
    const giannis = pool.find((p) => p.id === "antetokounmpo");
    expect(giannis?.perception).toBeGreaterThanOrEqual(84);
    expect(giannis?.impact).toBeGreaterThanOrEqual(88);
  });

  it("Giannis 2019-20 reflects back-to-back MVP recognition", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2019-20", "All");
    const giannis = pool.find((p) => p.id === "antetokounmpo");
    expect(giannis?.perception).toBeGreaterThanOrEqual(84);
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

describe("defensive specialist recognition", () => {
  it("Caruso peak season reflects nationally recognized defensive value", () => {
    const seasons = PLAYERS.filter((p) => p.id === "caruso");
    const peakPerception = Math.max(...seasons.map((p) => p.perception));
    const okc = seasons.find((p) => p.season === "2024-25");
    expect(peakPerception).toBeGreaterThanOrEqual(65);
    expect(okc?.perception).toBeGreaterThanOrEqual(62);
    expect(okc!.impact - okc!.perception).toBeLessThanOrEqual(8);
  });

  it("Mobley is not Fool's Gold in his best diamond seasons", () => {
    const seasons = PLAYERS.filter((p) => p.id === "mobley");
    const peakDiamond = Math.max(...seasons.map((p) => p.impact - p.perception));
    expect(peakDiamond).toBeGreaterThan(0);
    expect(seasons.every((p) => p.perception <= p.impact + 2)).toBe(true);
  });

  it("Gobert DPOY seasons reflect nationally recognized rim-anchor status", () => {
    const dpoySeasons = ["2018-19", "2019-20", "2020-21", "2023-24"];
    for (const season of dpoySeasons) {
      const pool = filterSeasonPlayers(PLAYERS, season, "All");
      const gobert = pool.find((p) => p.id === "gobert");
      expect(gobert?.perception).toBeGreaterThanOrEqual(78);
      expect(gobert!.perception).toBeGreaterThanOrEqual(gobert!.impact - 6);
    }
  });

  it("Reaves 2025-26 reflects established rotation recognition, not undrafted obscurity", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2025-26", "All");
    const reaves = pool.find((p) => p.id === "reaves");
    expect(reaves?.perception).toBeGreaterThanOrEqual(74);
    expect(reaves!.impact - reaves!.perception).toBeLessThanOrEqual(10);
  });

  it("Pritchard 2025-26 reflects Sixth Man of the Year carryover recognition", () => {
    const pool = filterSeasonPlayers(PLAYERS, "2025-26", "All");
    const pritchard = pool.find((p) => p.id === "payton-pritchard");
    expect(pritchard?.perception).toBeGreaterThanOrEqual(70);
    expect(pritchard!.impact - pritchard!.perception).toBeLessThanOrEqual(8);
  });
});
