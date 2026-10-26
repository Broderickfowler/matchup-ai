import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { AnalysisResult, ParsedPlay, PropStat } from "@/lib/types";

type Matchup = { id: string; away: string; home: string };
type PlayerDirectoryEntry = { name: string; team: string };

export const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite"
] as const;

type GeminiModel = typeof GEMINI_MODELS[number];

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
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function statusCode(error: unknown) {
  if (typeof error === "object" && error && "status" in error) {
    const value = (error as { status?: unknown }).status;
    return typeof value === "number" ? value : null;
  }
  return null;
}

function isTransient(error: unknown) {
  const status = statusCode(error);
  return status === 408 || status === 429 || (status != null && status >= 500);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateJsonWithFallback(
  ai: GoogleGenAI,
  contents: string,
  responseJsonSchema: object
): Promise<{ text: string; model: GeminiModel }> {
  let lastError: unknown = null;

  for (const [index, model] of GEMINI_MODELS.entries()) {
    const attempts = index === 0 ? 2 : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema
          }
        });

        if (!response.text) throw new Error(`${model} returned no text.`);
        return { text: response.text, model };
      } catch (error) {
        lastError = error;
        if (!isTransient(error)) throw error;
        if (attempt < attempts - 1) await wait(700);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All Gemini models were unavailable.");
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
): Promise<{ play: ParsedPlay | null; clarification: string | null; model: GeminiModel | null } | null> {
  const ai = client();
  if (!ai) return null;

  const allowedPlayers = playerDirectory
    .filter((player) => [matchup.away, matchup.home].includes(player.team))
    .map((player) => `${player.name} (${player.team})`)
    .join(", ");

  const prompt = `You parse one NFL play for MATCHUP//AI.

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
- Return JSON only.`;

  const generated = await generateJsonWithFallback(ai, prompt, parseJsonSchema);
  const parsed = aiParseSchema.parse(JSON.parse(generated.text));

  if (!parsed.canParse) {
    return {
      play: null,
      clarification: parsed.reason ?? "Please make the play more specific.",
      model: generated.model
    };
  }

  const team = normalizeTeam(parsed.team, matchup);
  const opponent = normalizeTeam(parsed.opponent, matchup);
  if (!team || !opponent || team === opponent || parsed.marketType == null || parsed.direction == null) {
    return { play: null, clarification: "I need a clearer team, opponent, and market for this matchup.", model: generated.model };
  }

  if (parsed.marketType === "player_prop") {
    if (!parsed.player || !parsed.stat || parsed.threshold == null || !["over", "under"].includes(parsed.direction)) {
      return { play: null, clarification: "For a player prop, include the player, over/under, line, and stat.", model: generated.model };
    }
    const matchedPlayer = playerDirectory.find(
      (player) => player.name.toLowerCase() === parsed.player?.toLowerCase() && player.team === team
    );
    if (!matchedPlayer) {
      return { play: null, clarification: "That player is not available in the controlled demo dataset for this matchup.", model: generated.model };
    }
  }

  if ((parsed.marketType === "spread" || parsed.marketType === "game_total") && parsed.threshold == null) {
    return { play: null, clarification: "Include the numeric line so I can evaluate the play.", model: generated.model };
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
    clarification: null,
    model: generated.model
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

  const prompt = `Write a concise decision-intelligence explanation for this NFL play.

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
- Return JSON only.`;

  const generated = await generateJsonWithFallback(ai, prompt, explanationJsonSchema);
  return {
    ...explanationSchema.parse(JSON.parse(generated.text)),
    model: generated.model
  };
}

export async function probeGemini() {
  const ai = client();
  if (!ai) return { configured: false as const, reachable: false as const, model: null, response: null };

  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "Reply with exactly MATCHUP_AI_OK"
      });
      return {
        configured: true as const,
        reachable: response.text?.trim() === "MATCHUP_AI_OK",
        model,
        response: response.text?.trim() ?? null
      };
    } catch (error) {
      lastError = error;
      if (!isTransient(error)) throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All Gemini models were unavailable.");
}
