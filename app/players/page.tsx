import { PROFILES } from "@/data/players";
import Link from "next/link";

export default function PlayersIndexPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Player Profiles</h1>
        <p className="text-zinc-400">
          Deep dives on players flagged by the model — stats, trajectory, and Doubt Board rebuttals.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(PROFILES).map((p) => (
          <Link
            key={p.id}
            href={`/players/${p.id}`}
            className="rounded-lg border border-surface-border bg-surface-raised p-5 hover:border-accent/50 transition-colors"
          >
            <h2 className="font-medium text-white">{p.name}</h2>
            <p className="mt-2 text-sm text-zinc-500">{p.team} · {p.pos}</p>
            <p className="mt-1 text-sm text-zinc-400">{p.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
