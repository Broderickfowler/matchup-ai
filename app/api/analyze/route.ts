import { NextResponse } from "next/server";
import players from "@/data/players.json";
import teams from "@/data/teams.json";
import injuries from "@/data/injuries.json";
import demoSlate from "@/data/demo-slate.json";
import { parseLocalPlay } from "@/lib/analysis/parseLocalPlay";
import { selectFeatures } from "@/lib/analysis/featureSelector";
import { scorePlay } from "@/lib/analysis/score";
import { explainWithGemini, parsePlayWithGemini } from "@/lib/ai/gemini";
import type { ParsedPlay } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { matchupId?: string; text?: string } | null;
  if (!body?.matchupId || !body.text?.trim()) {
    return NextResponse.json({ error: "Choose a matchup and enter a play." }, { status: 400 });
  }

  const game = demoSlate.find((item) => item.id === body.matchupId);
  if (!game) {
    return NextResponse.json({ error: "This matchup is not available in the demo analysis dataset." }, { status: 404 });
  }

  const matchup = {
    id: game.id,
    away: game.awayTeam.abbreviation,
    home: game.homeTeam.abbreviation
  };

  let parsed: ParsedPlay | null = null;
  let geminiParsed = false;
  let aiModel: string | null = null;

  const cleanText = body.text.trim();
  const lowerText = cleanText.toLowerCase();
  const mentionedPlayer = players.find((player) => {
    const fullName = player.name.toLowerCase();
    const lastName = fullName.split(" ").at(-1) ?? fullName;
    return lowerText.includes(fullName) || lowerText.includes(lastName);
  });
  const hasPropDirectionAndLine = /\b(over|under)\s+\d+(?:\.\d+)?\b/i.test(cleanText);
  const hasSupportedStat = /\b(passing|rushing|receiving)\s+yards?\b/i.test(cleanText);

  if (mentionedPlayer && hasPropDirectionAndLine && !hasSupportedStat) {
    return NextResponse.json({
      error: `Please specify the stat type (e.g. passing yards) for ${mentionedPlayer.name}.`
    }, { status: 422 });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const aiParse = await parsePlayWithGemini(body.text, matchup, players);
      if (aiParse?.play) {
        parsed = aiParse.play;
        geminiParsed = true;
        aiModel = aiParse.model;
      } else if (aiParse?.clarification) {
        return NextResponse.json({ error: aiParse.clarification }, { status: 422 });
      }
    } catch (error) {
      console.error("Gemini parse failed; using deterministic fallback.", error);
    }
  }

  if (!parsed) {
    parsed = parseLocalPlay(body.text, matchup, players);
  }

  if (!parsed) {
    return NextResponse.json({
      error: "I could not confidently interpret that play. Include a supported moneyline, spread, total, or passing/rushing/receiving yards line."
    }, { status: 422 });
  }

  const evidence = selectFeatures(parsed, teams, players, injuries);
  if (!evidence.length) {
    return NextResponse.json({ error: "The demo dataset does not have enough structured inputs for that play yet." }, { status: 422 });
  }

  const deterministic = scorePlay(parsed, evidence);
  let result = { ...deterministic, mode: geminiParsed ? "gemini-assisted" as const : "demo-deterministic" as const, aiModel };

  if (process.env.GEMINI_API_KEY) {
    try {
      const explanation = await explainWithGemini(result);
      if (explanation) {
        result = {
          ...result,
          whyNow: explanation.whyNow,
          decisionBrief: explanation.decisionBrief,
          mode: "gemini-assisted",
          aiModel: explanation.model
        };
      }
    } catch (error) {
      console.error("Gemini explanation failed; keeping deterministic explanation.", error);
    }
  }

  return NextResponse.json(result);
}
