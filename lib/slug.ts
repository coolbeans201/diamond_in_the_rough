/** Normalize a player name for cross-source matching. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+(jr|sr|ii|iii|iv|v)$/i, "")
    .trim();
}

/** Default slug from display name (curated entries may override with a custom id). */
export function slugFromName(name: string): string {
  return normalizeName(name).replace(/\s+/g, "-");
}
