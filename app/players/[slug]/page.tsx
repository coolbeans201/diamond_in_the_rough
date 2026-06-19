import { DiamondTrajectory } from "@/components/Charts";
import { ProfileStatGrid } from "@/components/ProfileStatGrid";
import { PLAYERS_BY_ID, PROFILES } from "@/data/players";
import { buildPlayerSummaryStats } from "@/lib/profile-stats";
import { getPlayerSeasons, getPlayerTrajectory } from "@/lib/scoring";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const playerPool = PLAYERS_BY_ID.get(slug) ?? [];
  const seasons = getPlayerSeasons(playerPool);

  if (seasons.length === 0) {
    notFound();
  }

  const profile = PROFILES[slug];
  const latest = seasons[0];
  const trajectory = getPlayerTrajectory(playerPool);
  const name = profile?.name ?? latest.name;
  const team = profile?.team ?? latest.team;
  const pos = profile?.pos ?? latest.pos;
  const summaryStats = profile?.stats ?? buildPlayerSummaryStats(seasons);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">
            Rankings
          </Link>
          <span>/</span>
          <Link href="/players" className="hover:text-white">
            Players
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">{name}</h1>
          {profile && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              Spotlight
            </span>
          )}
        </div>
        <p className="max-w-2xl text-zinc-400">
          {profile?.tagline ??
            "Season-by-season impact vs perception across every eligible year in the pool."}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs text-zinc-400">
            {team}
          </span>
          <span className="rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs text-zinc-400">
            {pos}
          </span>
          <span className="rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs text-zinc-400">
            {seasons.length} eligible season{seasons.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <ProfileStatGrid
        stats={summaryStats}
        title={profile ? "Spotlight snapshot" : "At a glance"}
      />

      <section className="space-y-4 rounded-lg border border-surface-border bg-surface-raised p-6">
        <h2 className="text-lg font-medium text-white">Diamond score trajectory</h2>
        <DiamondTrajectory data={trajectory} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">Season log</h2>
        <div className="overflow-x-auto rounded-lg border border-surface-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-raised text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Season</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium text-right">Impact</th>
                <th className="px-4 py-3 font-medium text-right">Perception</th>
                <th className="px-4 py-3 font-medium text-right">Diamond</th>
                <th className="px-4 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr
                  key={s.season}
                  className="border-t border-surface-border hover:bg-surface-raised/40"
                >
                  <td className="px-4 py-3">
                    <Link href={`/?season=${s.season}`} className="text-white hover:text-accent">
                      {s.season}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.team}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.impact}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.perception}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium tabular-nums ${
                      s.diamond > 0 ? "text-diamond" : s.diamond < 0 ? "text-gold" : "text-zinc-400"
                    }`}
                  >
                    {s.diamond > 0 ? "+" : ""}
                    {s.diamond}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{s.highlight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {profile?.doubts && (
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-white">Doubt Board</h2>
          <div className="space-y-3">
            {profile.doubts.map((d) => (
              <div
                key={d.take}
                className="rounded-lg border border-surface-border bg-surface-raised p-5"
              >
                <p className="font-medium text-zinc-300">{d.take}</p>
                <p className="mt-2 text-sm text-zinc-400">{d.rebuttal}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {profile && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-500">Other spotlight profiles</h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(PROFILES)
              .filter((p) => p.id !== slug)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-zinc-400 hover:border-accent/50 hover:text-white"
                >
                  {p.name}
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
