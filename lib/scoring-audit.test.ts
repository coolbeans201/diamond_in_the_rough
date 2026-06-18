import { describe, expect, it } from "vitest";
import { PLAYERS } from "@/data/players";
import { filterSeasonPlayers, getRankings, withDiamond } from "@/lib/scoring";
import { normalizeName } from "@/lib/slug";
import { SEASONS } from "@/lib/types";

const SEASON_INDEX = Object.fromEntries(SEASONS.map((s, i) => [s, i]));

function isConsecutiveSeason(prev: string, curr: string): boolean {
  const a = SEASON_INDEX[prev];
  const b = SEASON_INDEX[curr];
  return a !== undefined && b === a + 1;
}

function collectIssues(): string[] {
  const issues: string[] = [];

  const seasonName = new Map<string, number>();
  for (const p of PLAYERS) {
    const key = `${p.season}:${normalizeName(p.name)}`;
    seasonName.set(key, (seasonName.get(key) ?? 0) + 1);
  }
  for (const [key, count] of seasonName) {
    if (count > 1) issues.push(`DUPLICATE: ${key} ×${count}`);
  }

  const nameToIds = new Map<string, Set<string>>();
  for (const p of PLAYERS) {
    const n = normalizeName(p.name);
    if (!nameToIds.has(n)) nameToIds.set(n, new Set());
    nameToIds.get(n)!.add(p.id);
  }
  for (const [name, ids] of nameToIds) {
    if (ids.size > 1) issues.push(`ID SPLIT: ${name} → ${[...ids].join(", ")}`);
  }

  for (const p of PLAYERS) {
    const d = withDiamond(p);
    if (d.diamond !== p.impact - p.perception) {
      issues.push(`MATH: ${p.name} ${p.season}`);
    }
  }

  for (const season of SEASONS) {
    const pool = filterSeasonPlayers(PLAYERS, season, "All");
    const { diamonds, foolGold } = getRankings(pool);

    for (const p of diamonds) {
      if (p.diamond <= 0) issues.push(`DIAMOND LEAK: ${p.name} ${season}`);
      if (p.impact >= 82 && p.perception >= 78) {
        issues.push(`POLISHED IN DIAMONDS: ${p.name} ${season}`);
      }
    }
    for (const p of foolGold) {
      if (p.diamond >= 0) issues.push(`FOOL'S GOLD LEAK: ${p.name} ${season}`);
      const extremeFgArchetypes = new Set(["westbrook", "simmons"]);
      if (p.diamond < -22 && !extremeFgArchetypes.has(p.id)) {
        issues.push(
          `EXTREME FOOL'S GOLD: ${p.name} ${season} (${p.impact}/${p.perception}, d=${p.diamond})`,
        );
      }
    }
  }

  const byId = new Map<string, typeof PLAYERS>();
  for (const p of PLAYERS) {
    if (!byId.has(p.id)) byId.set(p.id, []);
    byId.get(p.id)!.push(p);
  }
  for (const [id, rows] of byId) {
    const sorted = [...rows].sort((a, b) => a.season.localeCompare(b.season));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (!isConsecutiveSeason(prev.season, curr.season)) continue;

      const impactDelta = Math.abs(curr.impact - prev.impact);
      const percDelta = Math.abs(curr.perception - prev.perception);
      if (impactDelta >= 30 || percDelta >= 30) {
        issues.push(
          `CLIFF: ${curr.name} (${id}) ${prev.season}→${curr.season} ${prev.impact}/${prev.perception} → ${curr.impact}/${curr.perception}`,
        );
      }
    }
  }

  const STAR_IDS = [
    "jokic",
    "doncic",
    "sga",
    "edwards",
    "antetokounmpo",
    "tatum",
    "brunson",
    "wembanyama",
  ];
  for (const id of STAR_IDS) {
    const rows = PLAYERS.filter((p) => p.id === id).sort((a, b) =>
      a.season.localeCompare(b.season),
    );
    if (rows.length === 0) {
      issues.push(`STAR MISSING: ${id}`);
      continue;
    }
    const latest = rows[rows.length - 1];
    const d = withDiamond(latest);
    if (d.diamond < -10) {
      issues.push(`STAR NEGATIVE: ${latest.name} ${latest.season} diamond=${d.diamond}`);
    }
    const inFG = getRankings(
      filterSeasonPlayers(PLAYERS, latest.season, "All"),
    ).foolGold.some((p) => p.id === id);
    if (inFG) issues.push(`STAR IN FOOL'S GOLD: ${latest.name} ${latest.season}`);
  }

  return issues;
}

describe("scoring integrity audit", () => {
  it("has no data or scoring anomalies", () => {
    const issues = collectIssues();
    if (issues.length > 0) {
      console.log("\nAudit failures:\n" + issues.map((i) => `  • ${i}`).join("\n"));
    }
    expect(issues, issues.join("\n")).toEqual([]);
  });
});
