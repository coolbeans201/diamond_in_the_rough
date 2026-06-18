"use client";

import type { ScoredPlayer } from "@/lib/types";
import { useMemo, useState } from "react";

export type ScatterPlayer = Pick<
  ScoredPlayer,
  "id" | "name" | "season" | "impact" | "perception" | "diamond"
>;

type Props = {
  players: ScatterPlayer[];
};

type ViewMode = "top30" | "all";

export function ImpactScatter({ players }: Props) {
  const [selected, setSelected] = useState<string | null>(players[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("top30");

  const visible = useMemo(() => {
    let list = players;
    if (view === "top30") {
      list = [...players]
        .sort((a, b) => Math.abs(b.diamond) - Math.abs(a.diamond))
        .slice(0, 30);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [players, query, view]);

  const w = 560;
  const h = 400;
  const pad = 48;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search player…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[160px] flex-1 rounded-md border border-surface-border bg-surface px-3 py-1.5 text-sm text-white placeholder:text-zinc-500"
        />
        <div className="flex rounded-md border border-surface-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setView("top30")}
            className={`px-3 py-1.5 ${view === "top30" ? "bg-accent/20 text-accent" : "text-zinc-400 hover:text-white"}`}
          >
            Top 30 |diamond|
          </button>
          <button
            type="button"
            onClick={() => setView("all")}
            className={`px-3 py-1.5 ${view === "all" ? "bg-accent/20 text-accent" : "text-zinc-400 hover:text-white"}`}
          >
            All ({players.length})
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xl">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#2a3142" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#2a3142" />
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={pad}
          stroke="#3f4a5f"
          strokeDasharray="6 4"
        />
        <text x={w / 2} y={h - 12} textAnchor="middle" fill="#71717a" fontSize={12}>
          Perception Score
        </text>
        <text
          x={16}
          y={h / 2}
          textAnchor="middle"
          fill="#71717a"
          fontSize={12}
          transform={`rotate(-90 16 ${h / 2})`}
        >
          Impact Score
        </text>
        {visible.length === 0 && (
          <text x={w / 2} y={h / 2} textAnchor="middle" fill="#71717a" fontSize={13}>
            No players match your search
          </text>
        )}
        {visible.map((p) => {
          const x = pad + (p.perception / 100) * plotW;
          const y = h - pad - (p.impact / 100) * plotH;
          const isSelected = p.id === selected;
          const undervalued = p.diamond > 0;
          return (
            <g
              key={`${p.id}-${p.season}`}
              className="cursor-pointer"
              onClick={() => setSelected(p.id)}
            >
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 7 : 5}
                fill={undervalued ? "#22c55e" : "#ef4444"}
                fillOpacity={undervalued ? 0.85 : 0.7}
                stroke={isSelected ? "#3b82f6" : "#2a3142"}
                strokeWidth={isSelected ? 2 : 1}
              />
              {isSelected && (
                <text x={x + 10} y={y - 8} fill="#fafafa" fontSize={11}>
                  {p.name.split(" ").pop()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-zinc-500">
        Showing {visible.length} player{visible.length === 1 ? "" : "s"} · diagonal = fair value · click a dot to highlight
      </p>
      <div className="mt-3 flex gap-6 text-xs text-zinc-400">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-diamond" />
          Above diagonal (undervalued)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
          Below diagonal (overvalued)
        </span>
      </div>
    </div>
  );
}
