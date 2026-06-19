import { PlayerSearch, PlayerSearchHint } from "@/components/PlayerSearch";
import { PLAYER_DIRECTORY, PROFILES } from "@/data/players";
import Link from "next/link";

export default function PlayersIndexPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Players</h1>
        <p className="max-w-2xl text-zinc-400">
          Every eligible player in the pool has a profile page with season-by-season impact,
          perception, and diamond scores. Search below — fuzzy matching handles typos and
          partial names.
        </p>
        <PlayerSearch className="max-w-xl" autoFocus />
        <PlayerSearchHint />
        <p className="text-xs text-zinc-500">
          {PLAYER_DIRECTORY.length} players in directory
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-white">Spotlight profiles</h2>
          <p className="text-sm text-zinc-500">
            Deeper dives with extra stats and Doubt Board rebuttals for flagship cases.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(PROFILES).map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="rounded-lg border border-surface-border bg-surface-raised p-5 hover:border-accent/50 transition-colors"
            >
              <h3 className="font-medium text-white">{p.name}</h3>
              <p className="mt-2 text-sm text-zinc-500">
                {p.team} · {p.pos}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{p.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
