import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "Unknown Gemini connection error.";
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = "gemini-3.8-flash";

  if (!apiKey) {
    return NextResponse.json({
      geminiConfigured: false,
      geminiReachable: false,
      model,
      environment: process.env.NODE_ENV ?? "unknown",
      error: "GEMINI_API_KEY is not loaded."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: "Reply with exactly MATCHUP_AI_OK"
    });

    return NextResponse.json({
      geminiConfigured: true,
      geminiReachable: response.text?.trim() === "MATCHUP_AI_OK",
      model,
      environment: process.env.NODE_ENV ?? "unknown",
      response: response.text?.trim() ?? null,
      error: null
    });
  } catch (error) {
    return NextResponse.json({
      geminiConfigured: true,
      geminiReachable: false,
      model,
      environment: process.env.NODE_ENV ?? "unknown",
      response: null,
      error: safeError(error)
    });
  }
}
