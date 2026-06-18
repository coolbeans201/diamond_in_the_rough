import { DiamondTrajectory } from "@/components/Charts";
import { PLAYERS_BY_ID, PROFILES } from "@/data/players";
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

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Rankings</Link>
          <span>/</span>
          <span className="text-zinc-300">{name}</span>
        </div>
        <h1 className="text-3xl font-semibold text-white">{name}</h1>
        <p className="text-zinc-400">
          {profile?.tagline ??
            "Season-by-season impact vs perception across every eligible year in the pool."}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-surface-raised border border-surface-border px-2 py-1 text-xs text-zinc-400">
            {team}
          </span>
          <span className="rounded-md bg-surface-raised border border-surface-border px-2 py-1 text-xs text-zinc-400">
            {pos}
          </span>
          <span className="rounded-md bg-surface-raised border border-surface-border px-2 py-1 text-xs text-zinc-400">
            {seasons.length} eligible season{seasons.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {profile?.stats && (
        <section className="grid gap-4 sm:grid-cols-3">
          {profile.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-surface-border bg-surface-raised p-4"
            >
              <p className="text-2xl font-semibold text-white tabular-nums">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </section>
      )}

      <section className="rounded-lg border border-surface-border bg-surface-raised p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Diamond Score trajectory</h2>
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
                <tr key={s.season} className="border-t border-surface-border">
                  <td className="px-4 py-3">
                    <Link href={`/?season=${s.season}`} className="text-white hover:text-accent">
                      {s.season}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.team}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.impact}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.perception}</td>
                  <td className={`px-4 py-3 text-right font-medium tabular-nums ${s.diamond >= 0 ? "text-diamond" : "text-gold"}`}>
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
                  className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:border-accent/50"
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
