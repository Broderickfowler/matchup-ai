export function TopNav() {
  return (
    <header className="topNav">
      <a className="wordmark" href="#top">MATCHUP<span>//AI</span></a>
      <nav aria-label="Primary navigation">
        <a href="#picks">NFL Picks</a>
        <a href="#signals">Signals</a>
        <a href="#articles">Articles</a>
        <a className="navCta" href="#analyze">Analyze Play</a>
      </nav>
    </header>
  );
}
