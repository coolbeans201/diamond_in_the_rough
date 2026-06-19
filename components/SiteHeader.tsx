import Link from "next/link";
import { PlayerSearch } from "@/components/PlayerSearch";

const links = [
  { href: "/", label: "Rankings" },
  { href: "/explore", label: "Explore" },
  { href: "/players", label: "Players" },
  { href: "/hall", label: "Hall" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-raised/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="group min-w-0 shrink-0">
            <span className="text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-accent">
              Diamond in the Rough
            </span>
            <span className="hidden text-xs text-zinc-500 sm:block">
              NBA impact vs perception
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-0.5 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-surface-border hover:text-white sm:px-3"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-surface-border/60 pb-3 pt-2">
          <PlayerSearch className="max-w-md" placeholder="Search players…" />
        </div>
      </div>
    </header>
  );
}
