import { describe, expect, it } from "vitest";
import generatedPool from "@/data/generated-pool.json";
import { PLAYERS } from "@/data/players";
import { normalizeName } from "@/lib/slug";
import { SEASONS } from "@/lib/types";

function generatedKeys(): Set<string> {
  const keys = new Set<string>();
  for (const season of SEASONS) {
    for (const row of generatedPool.seasons[season] ?? []) {
      keys.add(`${season}:${normalizeName(row.name)}`);
    }
  }
  return keys;
}

describe("data integrity", () => {
  it("has no pool players without generated-pool backing", () => {
    const gen = generatedKeys();
    const orphans = PLAYERS.filter(
      (p) => !gen.has(`${p.season}:${normalizeName(p.name)}`),
    );
    if (orphans.length > 0) {
      console.log(
        "\nOrphan pool entries:\n" +
          orphans
            .map((p) => `  • ${p.season} ${p.name} source=${p.scoreSource}`)
            .join("\n"),
      );
    }
    expect(orphans.map((p) => `${p.season}:${p.name}`)).toEqual([]);
  });

  it("matches NBA suffix names to curated base names", () => {
    expect(normalizeName("Jimmy Butler III")).toBe(normalizeName("Jimmy Butler"));
    expect(normalizeName("Kelly Oubre Jr.")).toBe(normalizeName("Kelly Oubre"));
  });

  it("does not list Ben Simmons in 2025-26", () => {
    const simmons = PLAYERS.filter((p) => p.id === "simmons" && p.season === "2025-26");
    expect(simmons).toEqual([]);
  });

  it("has no duplicate id+season keys in the built pool", () => {
    const keys = new Map<string, string>();
    const dupes: string[] = [];
    for (const p of PLAYERS) {
      const key = `${p.id}-${p.season}`;
      const prev = keys.get(key);
      if (prev) dupes.push(`${key} (${prev} + ${p.name})`);
      else keys.set(key, p.name);
    }
    expect(dupes).toEqual([]);
  });
});
