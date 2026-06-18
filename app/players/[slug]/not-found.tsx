import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-white">Player not found</h1>
      <p className="text-zinc-400">This player doesn&apos;t have a detailed profile yet.</p>
      <Link href="/" className="text-accent hover:underline">
        Back to rankings
      </Link>
    </div>
  );
}
