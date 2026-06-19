import { PLAYER_DIRECTORY } from "@/data/players";
import { searchPlayers } from "@/lib/player-search";
import { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = searchPlayers(PLAYER_DIRECTORY, query, 15);
  return Response.json(results);
}
