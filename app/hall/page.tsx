import { ImpactPerceptionChart } from "@/components/Charts";
import { HALL_OF_DIAMONDS, PLAYERS_BY_ID } from "@/data/players";
import { getPlayerTrajectory } from "@/lib/scoring";
import Link from "next/link";

export default function HallPage() {
  const brunsonData = getPlayerTrajectory(PLAYERS_BY_ID.get("brunson") ?? []).map((p) => ({
    season: p.season,
    impact: p.impact,
    perception: p.perception,
  }));

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Hall of Diamonds</h1>
        <p className="max-w-2xl text-zinc-400">
          Players the model flagged before they broke out — proof that impact can precede perception.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {HALL_OF_DIAMONDS.map((entry) => (
          <Link
            key={entry.id}
            href={`/players/${entry.id}`}
            className="rounded-lg border border-surface-border bg-surface-raised p-5 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-medium text-white">{entry.name}</h2>
              <span className="rounded-full bg-diamond/10 px-2 py-0.5 text-xs font-medium text-diamond">
                +{entry.peakDiamond}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Flagged: {entry.seasons}</p>
            <p className="mt-1 text-sm text-zinc-300">{entry.outcome}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-lg border border-surface-border bg-surface-raised p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Model validation — Brunson</h2>
        <p className="text-sm text-zinc-500">
          Impact surged early; perception caught up after the 2026 championship
        </p>
        <ImpactPerceptionChart data={brunsonData} />
      </section>
    </div>
  );
}
