import { ImpactScatter } from "@/components/ImpactScatter";
import { SeasonFilters } from "@/components/SeasonFilters";
import { PLAYERS_BY_SEASON, POOL_GENERATED_AT } from "@/data/players";
import { scoreSeasonPool } from "@/lib/scoring";
import { Suspense } from "react";

function formatPoolDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  searchParams: Promise<{ season?: string; pos?: string }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const season = params.season ?? "2024-25";
  const pos = params.pos ?? "All";
  const players = scoreSeasonPool(PLAYERS_BY_SEASON[season] ?? [], pos);
  const scatterPlayers = players.map((p) => ({
    id: p.id,
    name: p.name,
    season: p.season,
    impact: p.impact,
    perception: p.perception,
    diamond: p.diamond,
  }));

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Explore</h1>
        <p className="max-w-2xl text-zinc-400">
          Impact vs Perception scatter plot. Players above the diagonal are undervalued;
          below are overvalued relative to the composite model.
        </p>
        <Suspense>
          <SeasonFilters />
        </Suspense>
        <p className="text-xs text-zinc-500">
          {players.length} eligible players · data updated {formatPoolDate(POOL_GENERATED_AT)}
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-surface-border bg-surface-raised p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Impact vs Perception — {season}</h2>
          <ImpactScatter players={scatterPlayers} />
        </section>

        <section className="rounded-lg border border-surface-border bg-surface-raised p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">Impact model</h2>
          <p className="text-sm text-zinc-500">
            All players use the same box-score formula.{" "}
            <a href="/methodology" className="text-accent hover:underline">
              See methodology
            </a>{" "}
            for the exact formulas.
          </p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex justify-between border-b border-surface-border pb-2">
              <span>Net EPM / BPM</span><span className="text-zinc-500">25%</span>
            </li>
            <li className="flex justify-between border-b border-surface-border pb-2">
              <span>On/off net rating</span><span className="text-zinc-500">20%</span>
            </li>
            <li className="flex justify-between border-b border-surface-border pb-2">
              <span>Clutch / 4Q production</span><span className="text-zinc-500">17%</span>
            </li>
            <li className="flex justify-between border-b border-surface-border pb-2">
              <span>True shooting %</span><span className="text-zinc-500">15%</span>
            </li>
            <li className="flex justify-between border-b border-surface-border pb-2">
              <span>Creation burden</span><span className="text-zinc-500">15%</span>
            </li>
            <li className="flex justify-between">
              <span>Durability</span><span className="text-zinc-500">8%</span>
            </li>
          </ul>
          <p className="text-xs text-zinc-500 pt-2">
            Perception blends contract tier, accolades, draft pedigree, media visibility, and championship resume.
          </p>
        </section>
      </div>
    </div>
  );
}
