import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { AnalysisResult, ParsedPlay, PropStat } from "@/lib/types";

type Matchup = { id: string; away: string; home: string };
type PlayerDirectoryEntry = { name: string; team: string };

const aiParseSchema = z.object({
  canParse: z.boolean(),
  reason: z.string().nullable(),
  marketType: z.enum(["moneyline", "spread", "game_total", "player_prop"]).nullable(),
  player: z.string().nullable(),
  stat: z.enum(["passing_yards", "rushing_yards", "receiving_yards"]).nullable(),
  direction: z.enum(["over", "under", "team"]).nullable(),
  threshold: z.number().nullable(),
  team: z.string().nullable(),
  opponent: z.string().nullable()
});

const parseJsonSchema = {
  type: "object",
  properties: {
    canParse: { type: "boolean" },
    reason: { type: ["string", "null"] },
    marketType: { type: ["string", "null"], enum: ["moneyline", "spread", "game_total", "player_prop", null] },
    player: { type: ["string", "null"] },
    stat: { type: ["string", "null"], enum: ["passing_yards", "rushing_yards", "receiving_yards", null] },
    direction: { type: ["string", "null"], enum: ["over", "under", "team", null] },
    threshold: { type: ["number", "null"] },
    team: { type: ["string", "null"] },
    opponent: { type: ["string", "null"] }
  },
  required: ["canParse", "reason", "marketType", "player", "stat", "direction", "threshold", "team", "opponent"],
  additionalProperties: false
} as const;

const explanationSchema = z.object({
  whyNow: z.string().min(1).max(320),
  decisionBrief: z.string().min(1).max(520)
});

const explanationJsonSchema = {
  type: "object",
  properties: {
    whyNow: { type: "string" },
    decisionBrief: { type: "string" }
  },
  required: ["whyNow", "decisionBrief"],
  additionalProperties: false
} as const;

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function normalizeTeam(value: string | null, matchup: Matchup) {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  if (upper === matchup.away || upper === matchup.home) return upper;
  return null;
}

export async function parsePlayWithGemini(
  text: string,
  matchup: Matchup,
  playerDirectory: PlayerDirectoryEntry[]
): Promise<{ play: ParsedPlay | null; clarification: string | null } | null> {
  const ai = client();
  if (!ai) return null;

  const allowedPlayers = playerDirectory
    .filter((player) => [matchup.away, matchup.home].includes(player.team))
    .map((player) => `${player.name} (${player.team})`)
    .join(", ");

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `You parse one NFL play for MATCHUP//AI.

Selected matchup: ${matchup.away} at ${matchup.home}
Supported markets: moneyline, spread, game total, passing yards, rushing yards, receiving yards.
Players available in the controlled dataset: ${allowedPlayers || "none listed"}.

User play: "${text}"

Rules:
- Parse only the selected matchup.
- Do not invent a player, team, line, or threshold.
- For player props, player and stat are required.
- For spread and player props, preserve the user's numeric threshold exactly.
- For game totals, team should be the home team and opponent the away team.
- For moneyline/spread, direction must be "team".
- If the request is ambiguous or missing a required line/threshold, set canParse=false and briefly explain what is needed.
- Return JSON only.`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: parseJsonSchema
    }
  });

  if (!response.text) throw new Error("Gemini parser returned no text.");
  const raw = JSON.parse(response.text);
  const parsed = aiParseSchema.parse(raw);

  if (!parsed.canParse) {
    return { play: null, clarification: parsed.reason ?? "Please make the play more specific." };
  }

  const team = normalizeTeam(parsed.team, matchup);
  const opponent = normalizeTeam(parsed.opponent, matchup);
  if (!team || !opponent || team === opponent || parsed.marketType == null || parsed.direction == null) {
    return { play: null, clarification: "I need a clearer team, opponent, and market for this matchup." };
  }

  if (parsed.marketType === "player_prop") {
    if (!parsed.player || !parsed.stat || parsed.threshold == null || !["over", "under"].includes(parsed.direction)) {
      return { play: null, clarification: "For a player prop, include the player, over/under, line, and stat." };
    }
    const matchedPlayer = playerDirectory.find(
      (player) => player.name.toLowerCase() === parsed.player?.toLowerCase() && player.team === team
    );
    if (!matchedPlayer) {
      return { play: null, clarification: "That player is not available in the controlled demo dataset for this matchup." };
    }
  }

  if ((parsed.marketType === "spread" || parsed.marketType === "game_total") && parsed.threshold == null) {
    return { play: null, clarification: "Include the numeric line so I can evaluate the play." };
  }

  return {
    play: {
      sport: "NFL",
      marketType: parsed.marketType,
      player: parsed.marketType === "player_prop" ? parsed.player : null,
      stat: parsed.marketType === "player_prop" ? parsed.stat as PropStat : null,
      direction: parsed.direction,
      threshold: parsed.marketType === "moneyline" ? null : parsed.threshold,
      team,
      opponent,
      originalText: text.trim()
    },
    clarification: null
  };
}

export async function explainWithGemini(result: AnalysisResult) {
  const ai = client();
  if (!ai) return null;

  const evidence = {
    direction: result.direction,
    signalStrength: result.signalStrength,
    dataConfidence: result.dataConfidence,
    finalConfidence: result.finalConfidence,
    supporting: result.supportingSignals.map((signal) => ({ label: signal.label, detail: signal.detail })),
    contradicting: result.contradictingSignals.map((signal) => ({ label: signal.label, detail: signal.detail })),
    missingInputs: result.missingInputs
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `Write a concise decision-intelligence explanation for this NFL play.

Play: ${result.play.originalText}
Deterministic evidence: ${JSON.stringify(evidence)}

Hard rules:
- The numbers above were calculated by code. Never change, recompute, reinterpret, or invent a score.
- Use only the supplied evidence.
- Mention meaningful contradicting evidence when present.
- If inputs are missing, state that uncertainty plainly.
- Do not promise a win, lock, guarantee, or betting outcome.
- "whyNow" should identify the most important current evidence in 1-2 sentences.
- "decisionBrief" should summarize the case for and against the play in 2-3 concise sentences.
- Return JSON only.`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: explanationJsonSchema
    }
  });

  if (!response.text) throw new Error("Gemini explanation returned no text.");
  return explanationSchema.parse(JSON.parse(response.text));
}
