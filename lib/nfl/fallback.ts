import demoSlate from "@/data/demo-slate.json";
import { gamesSchema } from "@/lib/schemas/game";
import type { Game } from "@/lib/types";

export function getFallbackSlate(): Game[] {
  return gamesSchema.parse(demoSlate);
}
