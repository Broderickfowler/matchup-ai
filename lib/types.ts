export type TeamRef = {
  id: string;
  abbreviation: string;
  name: string;
};

export type GameStatus = "scheduled" | "live" | "final";

export type Game = {
  id: string;
  dateTime: string;
  status: GameStatus;
  awayTeam: TeamRef;
  homeTeam: TeamRef;
  awayScore: number | null;
  homeScore: number | null;
};

export type MarketType = "moneyline" | "spread" | "game_total" | "player_prop";
export type PropStat = "passing_yards" | "rushing_yards" | "receiving_yards";

export type ParsedPlay = {
  sport: "NFL";
  marketType: MarketType;
  player: string | null;
  stat: PropStat | null;
  direction: "over" | "under" | "team";
  threshold: number | null;
  team: string;
  opponent: string;
  originalText: string;
};

export type EvidenceSignal = {
  id: string;
  label: string;
  value: number | string | null;
  direction: -1 | 0 | 1;
  strength: number;
  relevance: number;
  recency: number;
  present: boolean;
  sourceLabel: string;
  detail: string;
};

export type AnalysisDirection = "favorable" | "mixed" | "unfavorable";

export type AnalysisResult = {
  play: ParsedPlay;
  direction: AnalysisDirection;
  signalStrength: number;
  dataConfidence: number;
  dataConfidenceLabel: "High" | "Moderate" | "Limited";
  finalConfidence: number;
  supportingSignals: EvidenceSignal[];
  contradictingSignals: EvidenceSignal[];
  missingInputs: string[];
  biggestRisk: EvidenceSignal | null;
  whyNow: string;
  decisionBrief: string;
  mode: "demo-deterministic" | "gemini-assisted";
  aiModel?: string | null;
};
