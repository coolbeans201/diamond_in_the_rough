/**
 * Fetches every NBA player season from stats.nba.com and writes
 * data/generated-pool.json — the automatic eligibility base layer.
 *
 * Run: npm run generate-pool
 *      npm run generate-pool -- 2024-25
 *      npm run generate-pool -- --season 2024-25
 *      $env:SEASON="2024-25"; npm run generate-pool
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../data/generated-pool.json");

const ALL_SEASONS = [
  "2016-17", "2017-18", "2018-19", "2019-20", "2020-21",
  "2021-22", "2022-23", "2023-24", "2024-25", "2025-26",
];

const MIN_RS_GP = 40;
const MIN_MPG = 20;
const MIN_PLAYOFF_GP = 4;

const NBA_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.nba.com/",
  Origin: "https://www.nba.com",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

const RS_URL =
  "https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=";

const BIO_URL =
  "https://stats.nba.com/stats/leaguedashplayerbiostats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=";

const TAIL =
  "&SeasonSegment=&SeasonType=Regular%20Season&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=";

const PLAYOFF_TAIL =
  "&SeasonSegment=&SeasonType=Playoffs&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=";

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const SEASON_RE = /^\d{4}-\d{2}$/;

function isSeasonToken(value) {
  return SEASON_RE.test(value) && ALL_SEASONS.includes(value);
}

function addSeason(opts, season) {
  if (!isSeasonToken(season)) {
    throw new Error(`Unknown season: ${season}. Expected one of: ${ALL_SEASONS.join(", ")}`);
  }
  if (opts.seasons.length === ALL_SEASONS.length) {
    opts.seasons = [];
  }
  if (!opts.seasons.includes(season)) {
    opts.seasons.push(season);
  }
}

function parseArgs(argv) {
  if (argv.length === 0 && process.env.SEASON) {
    argv = [process.env.SEASON];
  }

  const opts = {
    seasons: [...ALL_SEASONS],
    retries: 5,
    timeoutMs: 60_000,
    seasonDelayMs: 1_500,
    requestDelayMs: 400,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--season") {
      const value = argv[++i];
      if (!value) throw new Error("--season requires a value like 2024-25");
      addSeason(opts, value);
    } else if (arg.startsWith("--season=")) {
      addSeason(opts, arg.slice("--season=".length));
    } else if (arg === "--retries") {
      opts.retries = Number(argv[++i]);
    } else if (arg.startsWith("--retries=")) {
      opts.retries = Number(arg.slice("--retries=".length));
    } else if (arg === "--timeout") {
      opts.timeoutMs = Number(argv[++i]);
    } else if (arg.startsWith("--timeout=")) {
      opts.timeoutMs = Number(arg.slice("--timeout=".length));
    } else if (arg === "--delay") {
      opts.seasonDelayMs = Number(argv[++i]);
    } else if (arg.startsWith("--delay=")) {
      opts.seasonDelayMs = Number(arg.slice("--delay=".length));
    } else if (arg === "--request-delay") {
      opts.requestDelayMs = Number(argv[++i]);
    } else if (arg.startsWith("--request-delay=")) {
      opts.requestDelayMs = Number(arg.slice("--request-delay=".length));
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (isSeasonToken(arg)) {
      addSeason(opts, arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (opts.seasons.length === 0) {
    throw new Error("No seasons selected.");
  }

  return opts;
}

function printHelp() {
  console.log(`Usage:
  npm run generate-pool
  npm run generate-pool -- 2024-25
  npm run generate-pool -- --season 2024-25
  $env:SEASON="2024-25"; npm run generate-pool

Options:
  <YYYY-YY>            Positional season (Windows-friendly)
  --season <YYYY-YY>   Fetch one or more seasons and merge into existing pool
  --retries <n>        Retry count per request (default: 5)
  --timeout <ms>       Per-request timeout (default: 60000)
  --delay <ms>         Pause between seasons (default: 1500)
  --request-delay <ms> Pause between requests within a season (default: 400)
`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isEligible(p) {
  const rsQualified = p.rsGp >= MIN_RS_GP && p.mpg >= MIN_MPG;
  const playoffQualified = p.playoffGp >= MIN_PLAYOFF_GP;
  return rsQualified || playoffQualified;
}

function inferPosition(stats, heightInches = 78) {
  const { pts, reb, ast } = stats;
  if (heightInches >= 84 && reb >= 6) return "C";
  if (heightInches >= 81 && reb >= 7) return "PF";
  if (ast >= 6) return "PG";
  if (ast >= 4 && pts >= 14) return "SG";
  if (reb >= 7) return "PF";
  return "SF";
}

function idx(headers, key) {
  const i = headers.indexOf(key);
  if (i === -1) throw new Error(`Missing NBA stat column: ${key}`);
  return i;
}

function num(row, i) {
  const v = row[i];
  return typeof v === "number" ? v : Number(v ?? 0);
}

function loadExistingPool() {
  if (!existsSync(OUT)) {
    return { generatedAt: new Date().toISOString(), seasons: {} };
  }
  return JSON.parse(readFileSync(OUT, "utf8"));
}

function writePool(pool) {
  writeFileSync(OUT, JSON.stringify(pool, null, 2));
}

async function fetchWithRetry(label, url, opts) {
  let lastError;

  for (let attempt = 1; attempt <= opts.retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: NBA_HEADERS,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const err = new Error(
          `${label}: HTTP ${res.status}${body ? ` — ${body.slice(0, 120)}` : ""}`,
        );
        if (!RETRYABLE_STATUS.has(res.status) || attempt === opts.retries) throw err;
        lastError = err;
      } else {
        const data = await res.json();
        const set = data.resultSets?.[0];
        if (!set) throw new Error(`${label}: NBA API empty result`);
        return { headers: set.headers, rows: set.rowSet };
      }
    } catch (err) {
      const isAbort = err.name === "AbortError";
      lastError = isAbort
        ? new Error(`${label}: timed out after ${opts.timeoutMs}ms`)
        : err;
      if (attempt === opts.retries) throw lastError;
    } finally {
      clearTimeout(timer);
    }

    const backoff = Math.min(12_000, 800 * 2 ** (attempt - 1));
    process.stdout.write(
      `\n  ${label} failed (attempt ${attempt}/${opts.retries}), retrying in ${backoff}ms... `,
    );
    await sleep(backoff);
  }

  throw lastError;
}

function parseDraftPick(row, headers) {
  const round = num(row, idx(headers, "DRAFT_ROUND"));
  const pick = num(row, idx(headers, "DRAFT_NUMBER"));
  if (!round || !pick) return null;
  return (round - 1) * 30 + pick;
}

async function fetchSeasonEligible(season, opts) {
  const rsUrl = `${RS_URL}${encodeURIComponent(season)}${TAIL}`;
  const bioUrl = `${BIO_URL}${encodeURIComponent(season)}${TAIL}`;
  const poUrl = `${RS_URL}${encodeURIComponent(season)}${PLAYOFF_TAIL}`;

  // Sequential requests — parallel calls often trigger NBA rate limits / hangs.
  const rs = await fetchWithRetry(`${season} regular season`, rsUrl, opts);
  await sleep(opts.requestDelayMs);
  const bio = await fetchWithRetry(`${season} bio`, bioUrl, opts);
  await sleep(opts.requestDelayMs);
  const po = await fetchWithRetry(`${season} playoffs`, poUrl, opts);

  const rsH = rs.headers;
  const bioById = new Map();
  for (const row of bio.rows) {
    const id = String(num(row, idx(bio.headers, "PLAYER_ID")));
    bioById.set(id, {
      height: num(row, idx(bio.headers, "PLAYER_HEIGHT_INCHES")) || 78,
      draftPick: parseDraftPick(row, bio.headers),
      age: num(row, idx(bio.headers, "AGE")),
    });
  }

  const playoffGp = new Map();
  for (const row of po.rows) {
    playoffGp.set(String(num(row, idx(po.headers, "PLAYER_ID"))), num(row, idx(po.headers, "GP")));
  }

  const players = [];
  for (const row of rs.rows) {
    const nbaId = String(num(row, idx(rsH, "PLAYER_ID")));
    const bioInfo = bioById.get(nbaId) ?? { height: 78, draftPick: null, age: 25 };
    const box = {
      pts: num(row, idx(rsH, "PTS")),
      reb: num(row, idx(rsH, "REB")),
      ast: num(row, idx(rsH, "AST")),
      stl: num(row, idx(rsH, "STL")),
      blk: num(row, idx(rsH, "BLK")),
      mpg: num(row, idx(rsH, "MIN")),
      gp: num(row, idx(rsH, "GP")),
      plusMinus: num(row, idx(rsH, "PLUS_MINUS")),
      age: bioInfo.age || num(row, idx(rsH, "AGE")),
      draftPick: bioInfo.draftPick,
    };

    players.push({
      season,
      nbaId,
      name: String(row[idx(rsH, "PLAYER_NAME")]),
      team: String(row[idx(rsH, "TEAM_ABBREVIATION")]),
      pos: inferPosition(box, bioInfo.height),
      rsGp: box.gp,
      mpg: box.mpg,
      playoffGp: playoffGp.get(nbaId) ?? 0,
      box,
    });
  }
  return players;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const pool = loadExistingPool();
  const failures = [];

  console.log(
    `NBA pool fetch — ${opts.seasons.length} season(s), timeout ${opts.timeoutMs}ms, ${opts.retries} retries`,
  );

  for (const season of opts.seasons) {
    process.stdout.write(`Fetching ${season}... `);
    try {
      const raw = await fetchSeasonEligible(season, opts);
      const eligible = raw.filter((r) => isEligible(r));
      pool.seasons[season] = eligible;
      pool.generatedAt = new Date().toISOString();
      writePool(pool);
      console.log(`${eligible.length} eligible / ${raw.length} total (saved)`);
    } catch (err) {
      failures.push({ season, message: err.message });
      console.log(`FAILED — ${err.message}`);
    }

    if (season !== opts.seasons[opts.seasons.length - 1]) {
      await sleep(opts.seasonDelayMs);
    }
  }

  if (failures.length > 0) {
    console.error("\nSome seasons failed:");
    for (const f of failures) {
      console.error(`  • ${f.season}: ${f.message}`);
    }
    console.error(
      "\nPartial progress was saved to data/generated-pool.json.",
    );
    console.error(
      "Retry failed seasons individually, e.g.: npm run generate-pool -- --season 2024-25",
    );
    process.exit(1);
  }

  console.log(`\nDone. Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
