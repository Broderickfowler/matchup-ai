import { NextResponse } from "next/server";
import { getNFLSlate } from "@/lib/nfl/adapter";

export async function GET() {
  const slate = await getNFLSlate();
  return NextResponse.json(slate);
}
