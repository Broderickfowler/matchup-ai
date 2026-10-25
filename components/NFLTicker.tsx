import type { Game } from "@/lib/types";

function gameLabel(game: Game) {
  if (game.status === "live") return `${game.awayScore ?? 0} - ${game.homeScore ?? 0} LIVE`;
  if (game.status === "final") return `${game.awayScore ?? 0} - ${game.homeScore ?? 0} FINAL`;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(game.dateTime));
}

export function NFLTicker({ games }: { games: Game[] }) {
  return (
    <section className="ticker" aria-label="NFL games">
      <div className="tickerLabel">NFL TODAY</div>
      <div className="tickerTrack">
        {games.map((game) => (
          <article className="tickerGame" key={game.id}>
            <div className="tickerTeams"><strong>{game.awayTeam.abbreviation}</strong><span>@</span><strong>{game.homeTeam.abbreviation}</strong></div>
            <div className="tickerMeta">{gameLabel(game)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
