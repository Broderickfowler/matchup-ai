"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";

function gameLabel(game: Game) {
  if (game.status === "live") return `${game.awayScore ?? 0} - ${game.homeScore ?? 0} LIVE`;
  if (game.status === "final") return `${game.awayScore ?? 0} - ${game.homeScore ?? 0} FN`;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(game.dateTime));
}

export function NFLTicker({ games: initialGames }: { games: Game[] }) {
  const [games, setGames] = useState(initialGames);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch(`/api/nfl?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;

        const payload = await response.json() as { games?: Game[] };
        if (active && Array.isArray(payload.games) && payload.games.length) {
          setGames(payload.games);
        }
      } catch {
        // Keep the last good snapshot visible if a refresh fails.
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="ticker" aria-label="NFL games">
      <div className="tickerLabel">NFL TODAY</div>
      <div className="tickerTrack">
        {games.map((game) => (
          <article className="tickerGame" key={game.id}>
            <div className="tickerTeams">
              <strong>{game.awayTeam.abbreviation}</strong>
              <span>@</span>
              <strong>{game.homeTeam.abbreviation}</strong>
            </div>
            <div className="tickerMeta">{gameLabel(game)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
