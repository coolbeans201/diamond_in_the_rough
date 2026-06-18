# Diamond in the Rough

Identifies the undervalued and overvalued NBA players (quieting the Jalen Brunson doubters).

An NBA analytics web app that surfaces **undervalued players** by comparing advanced impact metrics against public perception.

## What it does

- **Rankings** — Top 15 "diamonds" (undervalued) and Fool's Gold (overvalued) per season, 2016–17 through 2025–26
- **Explore** — Impact vs Perception scatter plot with season/position filters
- **Profiles** — Deep dives with Doubt Board (Brunson flagship + Maxey, Jalen Williams, Mobley, Hart)
- **Hall of Diamonds** — Players flagged before they broke out
- **Methodology** — Transparent scoring model and eligibility gates

## Scoring model

```
Diamond Score = Impact Score − Perception Score
```

- **Impact:** 50% regular season / 50% playoffs (EPM, on/off, clutch, TS%, creation, durability)
- **Perception:** Contract tier, accolades, draft pedigree, media visibility, championship resume
- **Eligibility:** ≥40 RS GP + ≥20 MPG, or ≥4 playoff GP; season-long injuries excluded
- **Pool:** Every eligible NBA player per season (auto-fetched from stats.nba.com); curated scores overlay featured players
- **Fool's Gold:** Only players with negative Diamond Score (never padded with positive scores)

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Vitest (scoring engine tests)

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
npm run dev      # Development server
npm run build    # Production build
npm run test           # Scoring engine + integrity audit
npm run audit:scoring  # Data/scoring anomaly check only
npm run generate-pool  # Refresh eligibility base from stats.nba.com
npm run lint     # ESLint
```

## Flagship case study

Jalen Brunson ranked as a strong diamond in 2023–24 and 2024–25 **before** the 2026 championship closed the perception gap — validating the model's core thesis.

## Future work

- Live EPM / contract / accolade feeds for perception scoring
- User-toggleable RS/playoff weight slider
- OG share images per player
