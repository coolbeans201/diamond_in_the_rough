# Diamond in the Rough

An NBA analytics web app that surfaces **undervalued players** by comparing advanced impact metrics against public perception.

## What it does

- **Rankings** — Top 15 "diamonds" (undervalued) and Fool's Gold (overvalued) per season, 2016–17 through 2025–26
- **Explore** — Impact vs Perception scatter plot with season/position filters
- **Profiles** — Deep dives with Doubt Board (Reaves flagship + Pritchard, Brunson, Maxey, Mobley, Hartenstein)
- **Hall of Diamonds** — Players the model flagged before perception caught up, with live peak scores
- **Methodology** — Transparent scoring model, peer-relative tiers, and eligibility gates

## Scoring model

```
Diamond Score = Impact Score − Perception Score
```

- **Formula-only:** Impact and perception come from one unified formula for every player — no hand-tuned score overrides.
- **Peer-relative tiers:** Scoring volume, defense, hub stars, and passing bigs are compared within position peer percentiles, not wing-vs-center proxies.
- **Draft & rotation logic:** Draft-slot lag fades for established rotation players (age 28+, heavy minutes). Late first-round picks get partial lag; undrafted breakouts retain more.
- **Defensive recognition:** Rim anchors and stock-heavy defenders (Gobert, Caruso, Mobley) are scored through peer defense percentiles, not punished as Fool's Gold.
- **Featured entries:** Highlights, confidence, and injury flags only — metadata for profiles, not score overrides.
- **Eligibility:** ≥40 RS GP + ≥20 MPG, or ≥4 playoff GP; season-long injuries excluded
- **Pool:** Every eligible NBA player per season (auto-fetched from stats.nba.com)
- **Fool's Gold:** Only players with negative Diamond Score; proportional reputation drift (no flat floor)

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Vitest (scoring engine + integrity tests)

## Getting started

### If `npm` is not recognized (Windows)

Node.js is not on your PATH. Either:

**Option A — portable Node (no admin, already set up on this machine):**

```powershell
cd "C:\Users\matth\.cursor\projects\empty-window\diamond-in-the-rough"
.\dev.ps1
```

**Option B — install Node.js LTS system-wide:**

Download from [https://nodejs.org/](https://nodejs.org/), then restart your terminal and run:

```powershell
npm install
npm run dev
```

**Option C — use full path to portable npm:**

```powershell
& "$env:LOCALAPPDATA\node-portable\node-v22.16.0-win-x64\npm.cmd" install
& "$env:LOCALAPPDATA\node-portable\node-v22.16.0-win-x64\npm.cmd" run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev            # Development server
npm run build          # Production build
npm run test           # Scoring engine + integrity audit (47 tests)
npm run audit:scoring  # Data/scoring anomaly check only
npm run generate-pool  # Refresh eligibility base from stats.nba.com
npm run lint           # ESLint
npx tsx scripts/peak-diamonds.ts  # Print peak diamond scores for curated players
```

## Flagship case study

**Austin Reaves** is the flagship profile: flagged as a +8 diamond in 2023–24 as an undrafted rotation player, with perception climbing from 63 to 83 by 2025–26 as the gap nearly closed. The Hall page validates three archetypes — Reaves (established rotation undervaluation), Brunson (late-pick star with a narrowing gap), and Hartenstein (undrafted anchor).

## Future work

- Live EPM / contract / accolade feeds for perception scoring
- User-toggleable RS/playoff weight slider
- OG share images per player
