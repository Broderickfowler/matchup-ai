import { getFallbackSlate } from "@/lib/nfl/fallback";
import { gamesSchema } from "@/lib/schemas/game";
import type { Game, GameStatus } from "@/lib/types";

type ESPNCompetitor = {
  homeAway?: "home" | "away";
  score?: string;
  team?: { id?: string; abbreviation?: string; displayName?: string };
};

type ESPNEvent = {
  id?: string;
  date?: string;
  status?: { type?: { state?: string; completed?: boolean } };
  competitions?: Array<{ competitors?: ESPNCompetitor[] }>;
};

type ESPNScoreboard = { events?: ESPNEvent[] };

function nflDateStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}${value.month}${value.day}`;
}

function statusFrom(event: ESPNEvent): GameStatus {
  if (event.status?.type?.completed) return "final";
  if (event.status?.type?.state === "in") return "live";
  return "scheduled";
}

function mapEvent(event: ESPNEvent): Game | null {
  const competitors = event.competitions?.[0]?.competitors ?? [];
  const away = competitors.find((team) => team.homeAway === "away");
  const home = competitors.find((team) => team.homeAway === "home");
  if (!event.id || !event.date || !away?.team || !home?.team) return null;

  return {
    id: event.id,
    dateTime: event.date,
    status: statusFrom(event),
    awayTeam: {
      id: away.team.id ?? away.team.abbreviation ?? "away",
      abbreviation: away.team.abbreviation ?? "AWY",
      name: away.team.displayName ?? "Away"
    },
    homeTeam: {
      id: home.team.id ?? home.team.abbreviation ?? "home",
      abbreviation: home.team.abbreviation ?? "HME",
      name: home.team.displayName ?? "Home"
    },
    awayScore: away.score == null ? null : Number(away.score),
    homeScore: home.score == null ? null : Number(home.score)
  };
}

export async function getNFLSlate(): Promise<{ games: Game[]; source: "live" | "fallback" }> {
  try {
    const date = nflDateStamp();
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date}`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error(`Scoreboard request failed: ${response.status}`);
    const payload = (await response.json()) as ESPNScoreboard;
    const normalized = (payload.events ?? []).map(mapEvent).filter((game): game is Game => Boolean(game));
    const games = gamesSchema.parse(normalized);
    if (!games.length) throw new Error("Live scoreboard returned no games");
    return { games, source: "live" };
  } catch {
    return { games: getFallbackSlate(), source: "fallback" };
  }
}
