import { RankingsTable } from "@/components/RankingsTable";
import { SeasonFilters } from "@/components/SeasonFilters";
import { PLAYERS_BY_SEASON, POOL_GENERATED_AT } from "@/data/players";
import { getRankings, scoreSeasonPool } from "@/lib/scoring";
import Link from "next/link";
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

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const season = params.season ?? "2024-25";
  const pos = params.pos ?? "All";
  const players = scoreSeasonPool(PLAYERS_BY_SEASON[season] ?? [], pos);
  const { diamonds, foolGold } = getRankings(players);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Diamond in the Rough
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Rankings of the most undervalued NBA players each season — where advanced
          impact (50% regular season / 50% playoffs) outruns public perception.{" "}
          <Link href="/players/reaves" className="text-accent hover:underline">
            See a case study
          </Link>{" "}
          for how the gap can close over time.
        </p>
        <Suspense>
          <SeasonFilters />
        </Suspense>
        <p className="text-xs text-zinc-500">
          {players.length} eligible players in pool · eligibility data updated{" "}
          {formatPoolDate(POOL_GENERATED_AT)}
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-white">Top 15 Diamonds — {season}</h2>
          <p className="text-sm text-zinc-500">
            Highest Impact minus Perception. Polished stars (high impact + high perception) excluded.
          </p>
        </div>
        <RankingsTable players={diamonds} variant="diamond" />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-white">Fool&apos;s Gold — {season}</h2>
          <p className="text-sm text-zinc-500">
            Most overvalued players — negative Diamond Score only (perception exceeds impact).
          </p>
        </div>
        {foolGold.length > 0 ? (
          <RankingsTable players={foolGold} variant="gold" />
        ) : (
          <p className="text-sm text-zinc-500">No overvalued players meet eligibility for this filter.</p>
        )}
      </section>
    </div>
  );
}
