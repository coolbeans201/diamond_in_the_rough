import { ImpactPerceptionChart } from "@/components/Charts";
import { HALL_OF_DIAMONDS, PLAYERS_BY_ID } from "@/data/players";
import { getPlayerTrajectory } from "@/lib/scoring";
import Link from "next/link";

const VALIDATION_PLAYERS = [
  {
    id: "reaves",
    title: "Reaves — undrafted to recognized",
    blurb: "Impact led in 2023-24 (+8); perception climbed to match by 2025-26",
  },
  {
    id: "brunson",
    title: "Brunson — late-pick star gap",
    blurb: "Peak +12 in 2022-23; gap narrowed but impact still leads (+6 in 2025-26)",
  },
  {
    id: "isaiah-hartenstein",
    title: "Hartenstein — undrafted anchor",
    blurb: "Sustained +8–12 diamonds as a starting-caliber center without All-Star votes",
  },
] as const;

export default function HallPage() {
  const validationCharts = VALIDATION_PLAYERS.map(({ id, title, blurb }) => ({
    id,
    title,
    blurb,
    data: getPlayerTrajectory(PLAYERS_BY_ID.get(id) ?? []).map((p) => ({
      season: p.season,
      impact: p.impact,
      perception: p.perception,
    })),
  }));

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Hall of Diamonds</h1>
        <p className="max-w-2xl text-zinc-400">
          Players the model flagged before perception caught up — with calibrated peaks
          from the current formula, not hand-tuned overrides.
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

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-white">Model validation</h2>
          <p className="text-sm text-zinc-500 max-w-2xl">
            Three archetypes the recalibrated scoring is built around — established rotation
            undervaluation, late-pick stars, and undrafted role players.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {validationCharts.map(({ id, title, blurb, data }) => (
            <div
              key={id}
              className="rounded-lg border border-surface-border bg-surface-raised p-5 space-y-4"
            >
              <div>
                <h3 className="font-medium text-white">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{blurb}</p>
              </div>
              {data.length > 0 ? (
                <ImpactPerceptionChart data={data} />
              ) : (
                <p className="text-sm text-zinc-500">No eligible seasons in pool.</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
