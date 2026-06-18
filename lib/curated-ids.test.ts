import { describe, expect, it } from "vitest";
import { CONTEMPORARY_ENTRIES } from "@/data/entries-contemporary";
import { LEGACY_ENTRIES } from "@/data/entries-legacy";
import { RECENT_ENTRIES } from "@/data/entries-recent";
import { normalizeName } from "@/lib/slug";

const ALL_CURATED = [...LEGACY_ENTRIES, ...RECENT_ENTRIES, ...CONTEMPORARY_ENTRIES];

describe("curated id uniqueness", () => {
  it("does not reuse the same id for different player names", () => {
    const idToNames = new Map<string, Set<string>>();
    for (const entry of ALL_CURATED) {
      if (!idToNames.has(entry.id)) idToNames.set(entry.id, new Set());
      idToNames.get(entry.id)!.add(entry.name);
    }

    const collisions = [...idToNames.entries()].filter(([, names]) => names.size > 1);
    if (collisions.length > 0) {
      console.log(
        "\nID reused across different names:\n" +
          collisions.map(([id, names]) => `  • ${id}: ${[...names].join(" | ")}`).join("\n"),
      );
    }
    expect(collisions).toEqual([]);
  });

  it("maps each curated name to its own id slug", () => {
    const nameToId = new Map<string, string>();
    for (const entry of ALL_CURATED) {
      const key = normalizeName(entry.name);
      const prev = nameToId.get(key);
      if (prev && prev !== entry.id) {
        throw new Error(`${entry.name} has conflicting ids: ${prev} vs ${entry.id}`);
      }
      nameToId.set(key, entry.id);
    }
    expect(nameToId.size).toBeGreaterThan(0);
  });
});
