import Link from "next/link";

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre className="rounded-lg border border-surface-border bg-surface-raised p-4 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function WeightRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between border-b border-surface-border pb-2 text-sm text-zinc-300">
      <span>{label}</span>
      <span className="text-zinc-500 tabular-nums">{value}</span>
    </li>
  );
}

export default function MethodologyPage() {
  return (
    <div className="prose prose-invert max-w-3xl space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Methodology</h1>
        <p className="text-zinc-400">
          Diamond in the Rough compares what the data says a player contributed (impact)
          against what the market and discourse believe (perception). The gap between them
          is the Diamond Score.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-white">Diamond Score</h2>
        <Formula>Diamond Score = Impact Score − Perception Score</Formula>
        <p className="text-sm text-zinc-400">
          Both inputs are on a 0–100 scale (in practice clamped to 35–92). Positive means
          impact exceeds perception — the player is undervalued. Negative means perception
          exceeds impact — Fool&apos;s Gold.
        </p>
        <ul className="list-disc pl-5 text-zinc-400 space-y-1 text-sm">
          <li><strong className="text-diamond">+20 or higher</strong> — strong diamond</li>
          <li><strong className="text-zinc-300">+10 to +20</strong> — moderate diamond</li>
          <li><strong className="text-zinc-300">0 to +10</strong> — slight undervaluation</li>
          <li><strong className="text-gold">Below 0</strong> — Fool&apos;s Gold (overvalued)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-white">Two ways scores are assigned</h2>
        <p className="text-sm text-zinc-400">
          Every eligible player-season gets an impact and perception number. How those numbers
          are produced depends on whether we have a hand-tuned row for that player:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-2">
            <p className="text-sm font-medium text-accent">Curated</p>
            <p className="text-sm text-zinc-400">
              Impact and perception are set manually for spotlight players — typically after
              reviewing advanced metrics (EPM/BPM, on/off, playoff tape, contract context,
              accolades, and narrative). Shown with a <strong className="text-accent">Curated</strong> badge
              in rankings.
            </p>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-2">
            <p className="text-sm font-medium text-zinc-300">Estimated</p>
            <p className="text-sm text-zinc-400">
              A deterministic formula computed from NBA.com box score inputs (points, rebounds,
              assists, steals, blocks, plus/minus, games played, age, draft slot). Everyone in
              the pool without a curated override uses this path.
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          Eligibility stats (GP, MPG, playoff GP, team) always come from the NBA stats snapshot.
          Curated rows only replace impact/perception — they never invent a player who is not in
          that snapshot.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-white">Estimated impact — exact formula</h2>
        <p className="text-sm text-zinc-400">
          First we build a production index from per-game box score stats, then clamp the result
          to 35–92:
        </p>
        <Formula>{`production =
  PTS × 1.25 + REB × 0.85 + AST × 1.1
  + STL × 1.6 + BLK × 1.6

durability =
  +3 if GP ≥ 65
  +1 if GP ≥ 50
   0 otherwise

rawImpact = 36 + production + PLUS_MINUS × 0.55 + durability

Impact = clamp(rawImpact, 35, 92)`}</Formula>
        <p className="text-sm text-zinc-400">Per-stat weights in the production index:</p>
        <ul className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-0 list-none">
          <WeightRow label="Points (PTS)" value="× 1.25" />
          <WeightRow label="Rebounds (REB)" value="× 0.85" />
          <WeightRow label="Assists (AST)" value="× 1.1" />
          <WeightRow label="Steals (STL)" value="× 1.6" />
          <WeightRow label="Blocks (BLK)" value="× 1.6" />
          <WeightRow label="Plus/minus" value="× 0.55" />
          <WeightRow label="Durability (GP)" value="+0 to +3" />
          <WeightRow label="Base offset" value="+36" />
        </ul>
        <p className="text-sm text-zinc-500">
          The formula is calibrated so a ~27 PPG young star with positive plus/minus lands
          around 80+ impact — in the same ballpark as curated All-NBA wings.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-white">Estimated perception — exact formula</h2>
        <p className="text-sm text-zinc-400">
          Perception starts from the same production index (before clamping), then applies
          pedigree and age skew — the idea being that young stars are often hyped ahead of
          their production, while older vets can carry reputation above current output:
        </p>
        <Formula>{`base = rawImpact  (same production index as above)

draftBoost =
  +4 if drafted top 3
  +2 if drafted 4–10
   0 if undrafted or 11+

ageSkew =
  −7 if age ≤ 25
  +4 if age 30–31
  +7 if age ≥ 32
   0 otherwise

Perception = clamp(base + draftBoost + ageSkew, 35, 92)`}</Formula>
        <p className="text-sm text-zinc-400">
          This heuristic alone rarely produces extreme Fool&apos;s Gold gaps (e.g. a veteran
          with perception 80+ and impact in the 50s). Those cases come from curated perception
          scores that reflect contract tier, past accolades, and media visibility beyond what
          box score stats capture.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-white">Curated scoring — target model</h2>
        <p className="text-sm text-zinc-400">
          Hand-tuned scores aim at a fuller model than the estimated heuristic. When we curate,
          impact is judged on a 50% regular season / 50% playoffs blend using qualitative
          weight on:
        </p>
        <ul className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-0 list-none">
          <WeightRow label="Net EPM / BPM" value="25%" />
          <WeightRow label="On/off net rating" value="20%" />
          <WeightRow label="Clutch / 4Q production" value="17%" />
          <WeightRow label="True shooting %" value="15%" />
          <WeightRow label="Creation burden" value="15%" />
          <WeightRow label="Durability" value="8%" />
        </ul>
        <p className="text-sm text-zinc-400">
          Curated perception blends contract tier, accolades, draft pedigree, media visibility,
          and championship resume — the factors that move public reputation faster than per-game
          box score stats.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-white">How rankings are built</h2>
        <p className="text-sm text-zinc-400">
          For each season (and optional position filter), we score every eligible player, then:
        </p>
        <ol className="list-decimal pl-5 text-zinc-400 space-y-2 text-sm">
          <li>
            <strong className="text-zinc-300">Polished stars are excluded from Diamonds.</strong>{" "}
            If a player has impact ≥ 82 <em>and</em> perception ≥ 78, they are treated as
            fairly valued at the top of the market — not a hidden gem — and removed from the
            diamond list even if their diamond score is positive.
          </li>
          <li>
            <strong className="text-zinc-300">Top 15 Diamonds</strong> — remaining players with
            diamond &gt; 0, sorted highest first.
          </li>
          <li>
            <strong className="text-zinc-300">Top 15 Fool&apos;s Gold</strong> — players with
            diamond &lt; 0 only, sorted most negative first. The list is never padded with
            positive-score players.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-white">Eligibility gates</h2>
        <p className="text-sm text-zinc-400">
          A player only enters a season&apos;s pool if they actually played meaningful minutes:
        </p>
        <ul className="list-disc pl-5 text-zinc-400 space-y-1 text-sm">
          <li>Regular season: ≥ 40 GP <strong>and</strong> ≥ 20 MPG, or</li>
          <li>Playoffs: ≥ 4 GP (even if regular-season minutes were limited)</li>
          <li>
            Season-long injuries flagged in curated data (e.g. Lillard Achilles, Butler missed
            postseason) are excluded entirely via <code className="text-zinc-300">seasonLongInjury</code>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-white">Confidence labels</h2>
        <p className="text-sm text-zinc-400">
          For estimated players, confidence reflects sample size from games played in the snapshot:
        </p>
        <ul className="list-disc pl-5 text-zinc-400 space-y-1 text-sm">
          <li><strong className="text-zinc-300">High</strong> — 60+ GP</li>
          <li><strong className="text-zinc-300">Medium</strong> — 45–59 GP</li>
          <li><strong className="text-zinc-300">Low</strong> — 40–44 GP (or playoff-only qualifier)</li>
        </ul>
        <p className="text-sm text-zinc-500">
          Curated players carry a hand-set confidence reflecting how much trust we have in the
          underlying metrics and narrative.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-white">Player pool &amp; data sources</h2>
        <p className="text-sm text-zinc-400">
          The eligibility base is every NBA player who passes the gates above, pulled from
          stats.nba.com and written to <code className="text-zinc-300">generated-pool.json</code> via{" "}
          <code className="text-zinc-300">npm run generate-pool</code>. The script retries on
          timeouts, saves after each season, and supports resuming a single season if the API
          is flaky: <code className="text-zinc-300">npm run generate-pool -- 2024-25</code>.
        </p>
        <p className="text-sm text-zinc-400">
          Inputs per player-season from the API: points, rebounds, assists, steals, blocks,
          minutes, games played, plus/minus, age, height, and draft position. Position is
          inferred from height and stat profile when not explicitly provided.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-white">Known limitations</h2>
        <ul className="list-disc pl-5 text-zinc-400 space-y-1 text-sm">
          <li>Estimated scores use regular-season per-game box score stats only — no playoff blend yet.</li>
          <li>Plus/minus from NBA.com is team-context noisy; curated scores lean on better metrics where available.</li>
          <li>Defense, spacing, and role value are only partially captured by the estimated formula.</li>
          <li>2025-26 curated narrative overlays are illustrative; stats still come from the static snapshot.</li>
        </ul>
      </section>

      <p className="text-sm">
        <Link href="/players/brunson" className="text-accent hover:underline">
          See the Brunson case study →
        </Link>
      </p>
    </div>
  );
}
