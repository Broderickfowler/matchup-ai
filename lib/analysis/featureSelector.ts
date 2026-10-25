import type { EvidenceSignal, ParsedPlay } from "@/lib/types";

type TeamRow = {
  team: string;
  powerRating: number;
  passOffense: number;
  rushOffense: number;
  passDefense: number;
  rushDefense: number;
  pace: number;
  recentScoring: number;
  turnoverControl: number;
  injuryStability: number;
};

type PlayerRow = {
  name: string;
  team: string;
  passingYardsRecentAvg: number | null;
  passingVolume: number | null;
  pressureResilience: number | null;
  rushingYardsRecentAvg: number | null;
  rushVolume: number | null;
  receivingYardsRecentAvg: number | null;
  targetShare: number | null;
  roleStability: number | null;
};

type InjuryRow = { entity: string; team: string; impactScore: number | null; present: boolean; note: string };

function signedFromScore(score: number | null, favorableHigh = true): -1 | 0 | 1 {
  if (score == null) return 0;
  const adjusted = favorableHigh ? score : 100 - score;
  if (adjusted >= 58) return 1;
  if (adjusted <= 42) return -1;
  return 0;
}

function strengthFromScore(score: number | null) {
  if (score == null) return 0;
  return Math.min(Math.abs(score - 50) / 35, 1);
}

function signal(id: string, label: string, value: number | string | null, direction: -1 | 0 | 1, strength: number, relevance: number, present: boolean, detail: string): EvidenceSignal {
  return { id, label, value, direction, strength, relevance, recency: 0.9, present, sourceLabel: "MATCHUP//AI demo dataset", detail };
}

function flipForUnder(direction: -1 | 0 | 1, play: ParsedPlay): -1 | 0 | 1 {
  return play.direction === "under" ? (direction * -1) as -1 | 0 | 1 : direction;
}

export function selectFeatures(play: ParsedPlay, teams: TeamRow[], players: PlayerRow[], injuries: InjuryRow[]): EvidenceSignal[] {
  const team = teams.find((row) => row.team === play.team);
  const opponent = teams.find((row) => row.team === play.opponent);
  if (!team || !opponent) return [];

  const teamInjury = injuries.find((row) => row.team === play.team);
  const opponentInjury = injuries.find((row) => row.team === play.opponent);

  if (play.marketType === "player_prop") {
    const player = players.find((row) => row.name === play.player && row.team === play.team);
    if (!player || !play.stat || play.threshold == null) return [];

    const baselineKey = play.stat === "passing_yards" ? "passingYardsRecentAvg" : play.stat === "rushing_yards" ? "rushingYardsRecentAvg" : "receivingYardsRecentAvg";
    const volumeKey = play.stat === "passing_yards" ? "passingVolume" : play.stat === "rushing_yards" ? "rushVolume" : "targetShare";
    const defenseKey = play.stat === "rushing_yards" ? "rushDefense" : "passDefense";
    const baseline = player[baselineKey];
    const volume = player[volumeKey];
    const defense = opponent[defenseKey];
    const delta = baseline == null ? null : (baseline - play.threshold) / Math.max(play.threshold, 1);
    const baselineDirection: -1 | 0 | 1 = delta == null ? 0 : Math.abs(delta) < 0.03 ? 0 : delta > 0 ? 1 : -1;
    const usageDirection = signedFromScore(volume, true);
    const matchupDirection = signedFromScore(defense, false);
    const role = player.roleStability;
    const roleDirection = signedFromScore(role, true);

    return [
      signal("baseline", "Recent production vs line", baseline, flipForUnder(baselineDirection, play), delta == null ? 0 : Math.min(Math.abs(delta) / 0.2, 1), 1, baseline != null, baseline == null ? "Recent production is unavailable." : `Recent average is ${baseline} vs a ${play.threshold} line.`),
      signal("usage", "Recent usage / volume", volume, flipForUnder(usageDirection, play), strengthFromScore(volume), 0.9, volume != null, volume == null ? "Usage data is unavailable." : `Usage index is ${volume}/100.`),
      signal("matchup", "Opponent defensive matchup", defense, flipForUnder(matchupDirection, play), strengthFromScore(defense), 0.85, defense != null, `Opponent ${defenseKey === "passDefense" ? "pass" : "rush"} defense index is ${defense}/100.`),
      signal("role", "Role stability", role, flipForUnder(roleDirection, play), strengthFromScore(role), 0.72, role != null, role == null ? "Role stability is unavailable." : `Role stability is ${role}/100.`),
      signal("injury", "Team availability context", teamInjury?.impactScore ?? null, teamInjury?.present ? flipForUnder(teamInjury.impactScore != null && teamInjury.impactScore >= 0.5 ? -1 : 0, play) : 0, teamInjury?.impactScore ?? 0, 0.8, Boolean(teamInjury?.present), teamInjury?.note ?? "Injury context is unavailable.")
    ];
  }

  if (play.marketType === "moneyline" || play.marketType === "spread") {
    const powerEdge = team.powerRating - opponent.powerRating;
    const spreadPenalty = play.marketType === "spread" && play.threshold != null ? Math.abs(play.threshold) * 2 : 0;
    const adjustedPower = powerEdge - (play.threshold != null && play.threshold < 0 ? spreadPenalty : 0);
    return [
      signal("power", "Team strength edge", adjustedPower, adjustedPower > 3 ? 1 : adjustedPower < -3 ? -1 : 0, Math.min(Math.abs(adjustedPower) / 18, 1), 1, true, `Adjusted team-strength edge is ${adjustedPower.toFixed(1)} points on the demo index.`),
      signal("offense", "Scoring form", team.recentScoring, signedFromScore(team.recentScoring, true), strengthFromScore(team.recentScoring), 0.85, true, `Recent scoring index is ${team.recentScoring}/100.`),
      signal("turnovers", "Turnover control", team.turnoverControl, signedFromScore(team.turnoverControl, true), strengthFromScore(team.turnoverControl), 0.72, true, `Turnover-control index is ${team.turnoverControl}/100.`),
      signal("injury", "Team availability context", teamInjury?.impactScore ?? null, teamInjury?.present ? (teamInjury.impactScore != null && teamInjury.impactScore >= 0.5 ? -1 : 0) : 0, teamInjury?.impactScore ?? 0, 0.8, Boolean(teamInjury?.present), teamInjury?.note ?? "Injury context is unavailable.")
    ];
  }

  const avgPace = (team.pace + opponent.pace) / 2;
  const avgScoring = (team.recentScoring + opponent.recentScoring) / 2;
  const avgDefense = (team.passDefense + team.rushDefense + opponent.passDefense + opponent.rushDefense) / 4;
  const paceDir = flipForUnder(signedFromScore(avgPace, true), play);
  const scoreDir = flipForUnder(signedFromScore(avgScoring, true), play);
  const defenseDir = flipForUnder(signedFromScore(avgDefense, false), play);
  return [
    signal("pace", "Combined pace", avgPace, paceDir, strengthFromScore(avgPace), 0.82, true, `Combined pace index is ${avgPace.toFixed(0)}/100.`),
    signal("scoring", "Recent scoring environment", avgScoring, scoreDir, strengthFromScore(avgScoring), 1, true, `Combined recent scoring index is ${avgScoring.toFixed(0)}/100.`),
    signal("defense", "Defensive resistance", avgDefense, defenseDir, strengthFromScore(avgDefense), 0.8, true, `Combined defensive resistance index is ${avgDefense.toFixed(0)}/100.`),
    signal("availability", "Opponent availability context", opponentInjury?.impactScore ?? null, opponentInjury?.present ? (opponentInjury.impactScore != null && opponentInjury.impactScore >= 0.5 ? (play.direction === "over" ? 1 : -1) : 0) : 0, opponentInjury?.impactScore ?? 0, 0.64, Boolean(opponentInjury?.present), opponentInjury?.note ?? "Opponent injury context is unavailable.")
  ];
}
