import type { ProfileStat } from "@/lib/types";

const toneClass: Record<NonNullable<ProfileStat["tone"]>, string> = {
  diamond: "text-diamond",
  gold: "text-gold",
  neutral: "text-white",
};

type Props = {
  stats: ProfileStat[];
  title?: string;
};

export function ProfileStatGrid({ stats, title }: Props) {
  if (stats.length === 0) return null;

  return (
    <section className="space-y-3">
      {title && <h2 className="text-sm font-medium text-zinc-500">{title}</h2>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={`${stat.label}-${stat.detail ?? stat.value}`}
            className="rounded-lg border border-surface-border bg-surface-raised px-4 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {stat.label}
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                stat.tone ? toneClass[stat.tone] : "text-white"
              }`}
            >
              {stat.value}
            </p>
            {stat.detail && <p className="mt-1 text-sm text-zinc-500">{stat.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
