import { describe, expect, it } from "vitest";
import { searchPlayers, type PlayerDirectoryEntry } from "./player-search";

const DIRECTORY: PlayerDirectoryEntry[] = [
  { id: "reaves", name: "Austin Reaves", team: "LAL", pos: "SG" },
  { id: "brunson", name: "Jalen Brunson", team: "NYK", pos: "PG" },
  { id: "lebron-james", name: "LeBron James", team: "LAL", pos: "SF" },
  { id: "giannis-antetokounmpo", name: "Giannis Antetokounmpo", team: "MIL", pos: "PF" },
  { id: "payton-pritchard", name: "Payton Pritchard", team: "BOS", pos: "PG" },
];

describe("searchPlayers", () => {
  it("matches exact and partial names", () => {
    expect(searchPlayers(DIRECTORY, "reaves")[0]?.id).toBe("reaves");
    expect(searchPlayers(DIRECTORY, "austin")[0]?.id).toBe("reaves");
    expect(searchPlayers(DIRECTORY, "jalen")[0]?.id).toBe("brunson");
  });

  it("fuzzy-matches typos", () => {
    expect(searchPlayers(DIRECTORY, "brunsn")[0]?.id).toBe("brunson");
    expect(searchPlayers(DIRECTORY, "austn reaves")[0]?.id).toBe("reaves");
    expect(searchPlayers(DIRECTORY, "pritchar")[0]?.id).toBe("payton-pritchard");
  });

  it("matches last names and nicknames loosely", () => {
    expect(searchPlayers(DIRECTORY, "lebron")[0]?.id).toBe("lebron-james");
    expect(searchPlayers(DIRECTORY, "giannis")[0]?.id).toBe("giannis-antetokounmpo");
  });

  it("returns nothing for very short or empty queries", () => {
    expect(searchPlayers(DIRECTORY, "a")).toEqual([]);
    expect(searchPlayers(DIRECTORY, "   ")).toEqual([]);
  });
});
