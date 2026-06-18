import type { ScoredPlayer } from "@/lib/types";
import { ScoreSourceBadge } from "@/components/ScoreSourceBadge";
import Link from "next/link";

type Props = {
  players: ScoredPlayer[];
  variant: "diamond" | "gold";
};

export function RankingsTable({ players, variant }: Props) {
  const scoreClass =
    variant === "diamond" ? "text-diamond" : "text-gold";

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-surface-raised text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 font-medium">Team</th>
            <th className="px-4 py-3 font-medium">Pos</th>
            <th className="px-4 py-3 font-medium text-right">Impact</th>
            <th className="px-4 py-3 font-medium text-right">Perception</th>
            <th className="px-4 py-3 font-medium text-right">Diamond</th>
            <th className="px-4 py-3 font-medium">Key stat</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr
              key={`${p.id}-${p.season}`}
              className="border-t border-surface-border hover:bg-surface-raised/50"
            >
              <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/players/${p.id}`} className="font-medium text-white hover:text-accent">
                    {p.name}
                  </Link>
                  <ScoreSourceBadge source={p.scoreSource} />
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-400">{p.team}</td>
              <td className="px-4 py-3 text-zinc-400">{p.pos}</td>
              <td className="px-4 py-3 text-right tabular-nums">{p.impact}</td>
              <td className="px-4 py-3 text-right tabular-nums">{p.perception}</td>
              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${scoreClass}`}>
                {p.diamond > 0 ? "+" : ""}
                {p.diamond}
              </td>
              <td className="px-4 py-3 text-zinc-400">{p.highlight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
