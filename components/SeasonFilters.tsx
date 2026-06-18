"use client";

import { SEASONS, POSITIONS } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SeasonFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const season = params.get("season") ?? "2024-25";
  const pos = params.get("pos") ?? "All";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={season}
          disabled={isPending}
          onChange={(e) => update("season", e.target.value)}
          className="rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={pos}
          disabled={isPending}
          onChange={(e) => update("pos", e.target.value)}
          className="rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All positions" : p}
            </option>
          ))}
        </select>
        {isPending && (
          <span className="text-xs text-zinc-500" aria-live="polite">
            Updating…
          </span>
        )}
      </div>
    </div>
  );
}
