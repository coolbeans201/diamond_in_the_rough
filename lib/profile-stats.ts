import type { ProfileStat, ScoredPlayer } from "@/lib/types";

function diamondTone(score: number): ProfileStat["tone"] {
  if (score > 0) return "diamond";
  if (score < 0) return "gold";
  return "neutral";
}

function formatDiamond(score: number): string {
  if (score > 0) return `+${score}`;
  return String(score);
}

/** Live summary cards for any player page. */
export function buildPlayerSummaryStats(seasons: ScoredPlayer[]): ProfileStat[] {
  if (seasons.length === 0) return [];

  const peak = seasons.reduce((best, row) => (row.diamond > best.diamond ? row : best));
  const latest = seasons[0];

  return [
    {
      label: "Peak diamond",
      value: formatDiamond(peak.diamond),
      detail: peak.season,
      tone: diamondTone(peak.diamond),
    },
    {
      label: "Impact",
      value: String(latest.impact),
      detail: latest.season,
    },
    {
      label: "Perception",
      value: String(latest.perception),
      detail: latest.season,
    },
    {
      label: "Diamond",
      value: formatDiamond(latest.diamond),
      detail: latest.season,
      tone: diamondTone(latest.diamond),
    },
    {
      label: "Eligible seasons",
      value: String(seasons.length),
      detail: `${seasons.at(-1)?.season} – ${latest.season}`,
    },
  ];
}
