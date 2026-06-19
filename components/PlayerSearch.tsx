"use client";

import type { PlayerDirectoryEntry } from "@/lib/player-search";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export function PlayerSearch({
  placeholder = "Search any player…",
  className = "",
  autoFocus = false,
}: Props) {
  const listId = useId();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerDirectoryEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/players/search?q=${encodeURIComponent(trimmed)}`,
        );
        const data = (await response.json()) as PlayerDirectoryEntry[];
        setResults(data);
        setOpen(data.length > 0);
        setActiveIndex(data.length > 0 ? 0 : -1);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToPlayer(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/players/${id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "Enter" && results[0]) goToPlayer(results[0].id);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const pick = results[activeIndex] ?? results[0];
      if (pick) goToPlayer(pick.id);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-md border border-surface-border bg-surface/80 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:border-accent/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
      {loading && (
        <p className="absolute right-3 top-2.5 text-xs text-zinc-500">…</p>
      )}
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border border-surface-border bg-surface-raised py-1 shadow-lg"
        >
          {results.map((player, index) => (
            <li key={player.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToPlayer(player.id)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
                  index === activeIndex
                    ? "bg-accent/15 text-white"
                    : "text-zinc-300 hover:bg-surface-border/60"
                }`}
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-xs text-zinc-500">
                  {player.team} · {player.pos}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="absolute z-50 mt-1 w-full rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-zinc-500">
          No players found. Try a last name or alternate spelling.
        </p>
      )}
    </div>
  );
}

export function PlayerSearchHint() {
  return (
    <p className="text-xs text-zinc-500">
      Fuzzy search supported — typos and partial names work.{" "}
      <Link href="/players" className="text-accent hover:underline">
        Browse all players
      </Link>
    </p>
  );
}
