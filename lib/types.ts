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
