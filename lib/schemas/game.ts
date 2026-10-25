import { z } from "zod";

export const gameSchema = z.object({
  id: z.string(),
  dateTime: z.string(),
  status: z.enum(["scheduled", "live", "final"]),
  awayTeam: z.object({ id: z.string(), abbreviation: z.string(), name: z.string() }),
  homeTeam: z.object({ id: z.string(), abbreviation: z.string(), name: z.string() }),
  awayScore: z.number().nullable(),
  homeScore: z.number().nullable()
});

export const gamesSchema = z.array(gameSchema);
