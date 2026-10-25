import type { ParsedPlay, PropStat } from "@/lib/types";

type Matchup = { id: string; away: string; home: string };

const TEAM_ALIASES: Record<string, string[]> = {
  KC: ["kc", "chiefs", "kansas city"],
  SEA: ["sea", "seahawks", "seattle"],
  GB: ["gb", "packers", "green bay"],
  DET: ["det", "lions", "detroit"]
};

function resolveTeam(text: string, matchup: Matchup) {
  const lower = text.toLowerCase();
  for (const team of [matchup.away, matchup.home]) {
    if ((TEAM_ALIASES[team] ?? [team.toLowerCase()]).some((alias) => lower.includes(alias))) return team;
  }
  return null;
}

function opponentFor(team: string, matchup: Matchup) {
  return team === matchup.away ? matchup.home : matchup.away;
}

function statFrom(text: string): PropStat | null {
  if (/passing\s+yards?/i.test(text)) return "passing_yards";
  if (/rushing\s+yards?/i.test(text)) return "rushing_yards";
  if (/receiving\s+yards?/i.test(text)) return "receiving_yards";
  return null;
}

export function parseLocalPlay(text: string, matchup: Matchup, playerDirectory: Array<{ name: string; team: string }>): ParsedPlay | null {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const total = lower.match(/(?:game\s+total\s+)?(over|under)\s+(\d+(?:\.\d+)?)/i);
  if (total && /total|game|over|under/.test(lower) && !statFrom(lower)) {
    return {
      sport: "NFL", marketType: "game_total", player: null, stat: null,
      direction: total[1].toLowerCase() as "over" | "under", threshold: Number(total[2]),
      team: matchup.home, opponent: matchup.away, originalText: clean
    };
  }

  const stat = statFrom(lower);
  const prop = lower.match(/(over|under)\s+(\d+(?:\.\d+)?)/i);
  if (stat && prop) {
    const player = playerDirectory.find((entry) => lower.includes(entry.name.toLowerCase()));
    if (!player || ![matchup.away, matchup.home].includes(player.team)) return null;
    return {
      sport: "NFL", marketType: "player_prop", player: player.name, stat,
      direction: prop[1].toLowerCase() as "over" | "under", threshold: Number(prop[2]),
      team: player.team, opponent: opponentFor(player.team, matchup), originalText: clean
    };
  }

  const team = resolveTeam(lower, matchup);
  if (team && /moneyline|\bml\b/.test(lower)) {
    return {
      sport: "NFL", marketType: "moneyline", player: null, stat: null,
      direction: "team", threshold: null, team, opponent: opponentFor(team, matchup), originalText: clean
    };
  }

  if (team) {
    const spread = lower.match(/(?:spread\s*)?([+-]\d+(?:\.\d+)?)/);
    if (spread) {
      return {
        sport: "NFL", marketType: "spread", player: null, stat: null,
        direction: "team", threshold: Number(spread[1]), team, opponent: opponentFor(team, matchup), originalText: clean
      };
    }
  }

  return null;
}
