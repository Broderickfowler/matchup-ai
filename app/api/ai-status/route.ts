import { NextResponse } from "next/server";
import { GEMINI_MODELS, probeGemini } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "Unknown Gemini connection error.";
}

export async function GET() {
  try {
    const probe = await probeGemini();

    return NextResponse.json({
      geminiConfigured: probe.configured,
      geminiReachable: probe.reachable,
      activeModel: probe.model,
      fallbackOrder: GEMINI_MODELS,
      environment: process.env.NODE_ENV ?? "unknown",
      response: probe.response,
      error: null
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
    });
  } catch (error) {
    return NextResponse.json({
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      geminiReachable: false,
      activeModel: null,
      fallbackOrder: GEMINI_MODELS,
      environment: process.env.NODE_ENV ?? "unknown",
      response: null,
      error: safeError(error)
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
    });
  }
}
