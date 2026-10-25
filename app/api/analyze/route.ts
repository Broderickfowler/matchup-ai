import { NextResponse } from "next/server";
import players from "@/data/players.json";
import teams from "@/data/teams.json";
import injuries from "@/data/injuries.json";
import demoSlate from "@/data/demo-slate.json";
import { parseLocalPlay } from "@/lib/analysis/parseLocalPlay";
import { selectFeatures } from "@/lib/analysis/featureSelector";
import { scorePlay } from "@/lib/analysis/score";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { matchupId?: string; text?: string } | null;
  if (!body?.matchupId || !body.text?.trim()) {
    return NextResponse.json({ error: "Choose a matchup and enter a play." }, { status: 400 });
  }

  const game = demoSlate.find((item) => item.id === body.matchupId);
  if (!game) return NextResponse.json({ error: "This matchup is not available in the demo analysis dataset." }, { status: 404 });

  const parsed = parseLocalPlay(body.text, { id: game.id, away: game.awayTeam.abbreviation, home: game.homeTeam.abbreviation }, players);
  if (!parsed) {
    return NextResponse.json({ error: "I could not confidently interpret that play. Try a supported moneyline, spread, total, or passing/rushing/receiving yards play." }, { status: 422 });
  }

  const evidence = selectFeatures(parsed, teams, players, injuries);
  if (!evidence.length) return NextResponse.json({ error: "The demo dataset does not have enough structured inputs for that play yet." }, { status: 422 });

  return NextResponse.json(scorePlay(parsed, evidence));
}
