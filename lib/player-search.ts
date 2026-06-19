import { normalizeName } from "./slug";

export type PlayerDirectoryEntry = {
  id: string;
  name: string;
  team: string;
  pos: string;
};

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

function similarityScore(query: string, target: string, weight: number): number {
  if (!target) return 0;
  const dist = levenshtein(query, target);
  const sim = 1 - dist / Math.max(query.length, target.length);
  if (sim < 0.68) return 0;
  return Math.round(sim * weight);
}

function matchScore(query: string, entry: PlayerDirectoryEntry): number {
  const name = normalizeName(entry.name);
  const slug = entry.id.replace(/-/g, " ");

  if (name === query || slug === query) return 200;
  if (name.startsWith(query)) return 160;
  if (name.includes(query)) return 130;
  if (slug.includes(query)) return 120;

  const tokens = name.split(" ").filter(Boolean);
  const last = tokens.at(-1) ?? "";

  if (last.startsWith(query) || last === query) return 110;
  if (tokens.some((token) => token.startsWith(query))) return 95;

  const initials = tokens.map((token) => token[0] ?? "").join("");
  if (query.length >= 2 && initials.startsWith(query)) return 88;

  const fullNameScore = similarityScore(query, name, 80);
  if (fullNameScore) return fullNameScore;

  if (last.length >= 3) {
    const lastNameScore = similarityScore(query, last, 70);
    if (lastNameScore) return lastNameScore;
  }

  return 0;
}

/** Fuzzy player lookup — substring, prefix, initials, and edit-distance fallbacks. */
export function searchPlayers(
  directory: readonly PlayerDirectoryEntry[],
  query: string,
  limit = 12,
): PlayerDirectoryEntry[] {
  const normalized = normalizeName(query);
  if (normalized.length < 2) return [];

  const scored = directory
    .map((entry) => ({ entry, score: matchScore(normalized, entry) }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name),
    );

  return scored.slice(0, limit).map((row) => row.entry);
}
