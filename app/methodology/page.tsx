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
        <h2 className="text-xl font-medium text-white">Scoring pipeline</h2>
        <p className="text-sm text-zinc-400">
          Every eligible player-season gets impact and perception from the same box-score
          formulas below. Featured entry files only supply narrative highlights, confidence
          labels, and injury flags — not hand-tuned scores.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-white">Impact — exact formula</h2>
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
defenseBonus = peer-relative stocks/BLK/STL percentiles within position (+0 to +8)
playoffBoost = +1 to +5 based on playoff GP

Impact = clamp(rawImpact + defenseBonus + playoffBoost, 35, 92)`}</Formula>
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
        <h2 className="text-xl font-medium text-white">Perception — exact formula</h2>
        <p className="text-sm text-zinc-400">
          Perception starts from impact, then applies reputation adjustments that decay when
          production does not support them. Volume and defense tiers are calibrated against
          same-position peers each season — a 12 PPG center and a 12 PPG guard are not treated
          the same.
        </p>
        <Formula>{`peerPct = percentile rank within position for each stat (PTS, REB, AST, STL, BLK, stocks, +/-)
defensePct = average of STL/BLK/stocks peer percentiles

base = Impact

scoringTier = +1 to +3 by PTS peer percentile (70th / 85th / 95th)
pedigree = draft-slot boost (top 3 / lottery), faded when Impact < 68
legacy   = age 30+ premium, faded when Impact < 62
youthSkew = market lag for late-round breakouts and young #1 picks

Perception = clamp(adjusted base, 35, 92)

Caps & floors (peer-relative where noted):
  • MVP hubs (Impact ≥ 88, elite PTS/REB peers): perception within ~4–6 of impact
  • Playmaking bigs (elite AST + REB peers): hub floor even with moderate scoring volume
  • Recognized defenders (elite defensePct + age/playoff reps): perception tracks impact
  • Young lottery defensive bigs: slight diamond bias, not Fool's Gold
  • Hidden defensive gems (elite defensePct, low PTS peers): market lag
  • Pick 15 = lottery (not late-round) for market-lag purposes
  • Late first round (picks 16–30): half the undrafted/second-round lag
  • Established rotation (age 26+, 28+ MPG, 72+ impact): draft-slot lag fades sharply
  • Late-round stars age 29+ with deep playoff reps: market-lag discount fades
  • Lottery stars still producing (Impact ≥ 82, age ≤29): perception capped near impact
  • End-of-line vets (low PTS peers, age 34+): reputation capped tightly
  • Collapsed former stars (Impact < 62, age 28–34): legacy reputation lingers proportionally`}</Formula>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-white">Target model for advanced context</h2>
        <p className="text-sm text-zinc-400">
          The engine uses regular-season per-game box score stats plus a playoff-GP boost.
          Future versions may blend in EPM/BPM, on/off, and contract data directly. Featured
          player files still store narrative highlights and injury flags.
        </p>
        <p className="text-sm text-zinc-400">
          Long-term goal: blend in qualitative weight on:
        </p>
        <ul className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-0 list-none">
          <WeightRow label="Net EPM / BPM" value="25%" />
          <WeightRow label="On/off net rating" value="20%" />
          <WeightRow label="Clutch / 4Q production" value="17%" />
          <WeightRow label="True shooting %" value="15%" />
          <WeightRow label="Creation burden" value="15%" />
          <WeightRow label="Durability" value="8%" />
        </ul>
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
          Confidence reflects sample size from games played in the snapshot, or a hand-set
          label for featured players where narrative context matters:
        </p>
        <ul className="list-disc pl-5 text-zinc-400 space-y-1 text-sm">
          <li><strong className="text-zinc-300">High</strong> — 60+ GP</li>
          <li><strong className="text-zinc-300">Medium</strong> — 45–59 GP</li>
          <li><strong className="text-zinc-300">Low</strong> — 40–44 GP (or playoff-only qualifier)</li>
        </ul>
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
          <li>Formula-driven scores use regular-season per-game box score stats plus a small playoff-GP boost.</li>
          <li>Defense, spacing, and role value are only partially captured by the box-score formula.</li>
        </ul>
      </section>

      <p className="text-sm">
        <Link href="/players/reaves" className="text-accent hover:underline">
          See the Reaves case study →
        </Link>
      </p>
    </div>
  );
}

