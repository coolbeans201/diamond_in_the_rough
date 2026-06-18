import Link from "next/link";

const links = [
  { href: "/", label: "Rankings" },
  { href: "/explore", label: "Explore" },
  { href: "/players", label: "Profiles" },
  { href: "/hall", label: "Hall" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-surface-border bg-surface-raised/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group">
          <span className="text-lg font-semibold tracking-tight text-white group-hover:text-accent transition-colors">
            Diamond in the Rough
          </span>
          <span className="block text-xs text-zinc-500">NBA impact vs perception</span>
        </Link>
        <nav className="flex flex-wrap gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-surface-border hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
