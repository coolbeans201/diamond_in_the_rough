import type { Position } from "./types";
import { inferPosition, type BoxStats } from "./compute-scores";

const NBA_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Referer: "https://www.nba.com",
  Accept: "application/json",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
} as const;

const RS_URL =
  "https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=";

const BIO_URL =
  "https://stats.nba.com/stats/leaguedashplayerbiostats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=";

const TAIL =
  "&SeasonSegment=&SeasonType=Regular%20Season&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=";

const PLAYOFF_TAIL =
  "&SeasonSegment=&SeasonType=Playoffs&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=";

export type RawEligiblePlayer = {
  season: string;
  nbaId: string;
  name: string;
  team: string;
  pos: Position;
  rsGp: number;
  mpg: number;
  playoffGp: number;
  box: BoxStats;
};

type Row = unknown[];

function idx(headers: string[], key: string): number {
  const i = headers.indexOf(key);
  if (i === -1) throw new Error(`Missing NBA stat column: ${key}`);
  return i;
}

function num(row: Row, i: number): number {
  const v = row[i];
  return typeof v === "number" ? v : Number(v ?? 0);
}

async function fetchResultSet(url: string): Promise<{ headers: string[]; rows: Row[] }> {
  const res = await fetch(url, { headers: NBA_HEADERS });
  if (!res.ok) throw new Error(`NBA API ${res.status}: ${url}`);
  const data = await res.json();
  const set = data.resultSets?.[0];
  if (!set) throw new Error(`NBA API empty result: ${url}`);
  return { headers: set.headers as string[], rows: set.rowSet as Row[] };
}

function parseDraftPick(row: Row, headers: string[]): number | null {
  const round = num(row, idx(headers, "DRAFT_ROUND"));
  const pick = num(row, idx(headers, "DRAFT_NUMBER"));
  if (!round || !pick) return null;
  return (round - 1) * 30 + pick;
}

function parseHeightInches(row: Row, headers: string[]): number {
  const inches = num(row, idx(headers, "PLAYER_HEIGHT_INCHES"));
  return inches || 78;
}

export async function fetchSeasonEligible(season: string): Promise<RawEligiblePlayer[]> {
  const [rs, bio, po] = await Promise.all([
    fetchResultSet(`${RS_URL}${encodeURIComponent(season)}${TAIL}`),
    fetchResultSet(`${BIO_URL}${encodeURIComponent(season)}${TAIL}`),
    fetchResultSet(`${RS_URL}${encodeURIComponent(season)}${PLAYOFF_TAIL}`),
  ]);

  const rsH = rs.headers;
  const bioById = new Map<string, { height: number; draftPick: number | null; age: number }>();
  for (const row of bio.rows) {
    const id = String(num(row, idx(bio.headers, "PLAYER_ID")));
    bioById.set(id, {
      height: parseHeightInches(row, bio.headers),
      draftPick: parseDraftPick(row, bio.headers),
      age: num(row, idx(bio.headers, "AGE")),
    });
  }

  const playoffGp = new Map<string, number>();
  for (const row of po.rows) {
    playoffGp.set(String(num(row, idx(po.headers, "PLAYER_ID"))), num(row, idx(po.headers, "GP")));
  }

  const players: RawEligiblePlayer[] = [];
  for (const row of rs.rows) {
    const nbaId = String(num(row, idx(rsH, "PLAYER_ID")));
    const bioInfo = bioById.get(nbaId) ?? { height: 78, draftPick: null, age: 25 };
    const box: BoxStats = {
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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
