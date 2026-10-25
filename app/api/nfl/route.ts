import { NextResponse } from "next/server";
import { getNFLSlate } from "@/lib/nfl/adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const slate = await getNFLSlate();

  return NextResponse.json(slate, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}
