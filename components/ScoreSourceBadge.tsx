import type { ScoreSource } from "@/lib/types";

type Props = {
  source: ScoreSource;
  className?: string;
};

export function ScoreSourceBadge({ source, className = "" }: Props) {
  const curated = source === "curated";
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        curated
          ? "bg-accent/15 text-accent"
          : "bg-zinc-700/50 text-zinc-400"
      } ${className}`}
      title={
        curated
          ? "Hand-tuned impact and perception scores"
          : "Estimated from box score and draft pedigree"
      }
    >
      {curated ? "Curated" : "Estimated"}
    </span>
  );
}
