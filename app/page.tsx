import { NFLTicker } from "@/components/NFLTicker";
import { TopNav } from "@/components/TopNav";
import { PlayAnalyzer } from "@/components/PlayAnalyzer";
import { getNFLSlate } from "@/lib/nfl/adapter";

const previewPicks = [
  { matchup: "KC @ SEA", play: "KC moneyline", confidence: "74", signal: "FAVORABLE" },
  { matchup: "GB @ DET", play: "Game total over", confidence: "68", signal: "FAVORABLE" }
];

const previewSignals = [
  { index: "01", title: "ROLE CHANGE", copy: "Usage is moving toward a more concentrated backfield split.", image: "/visuals/signal-role.svg", alt: "Editorial football role-change graphic" },
  { index: "02", title: "MATCHUP", copy: "Recent pressure rate creates a meaningful passing-game constraint.", image: "/visuals/signal-matchup.svg", alt: "Editorial football matchup graphic" },
  { index: "03", title: "INJURY", copy: "A key designation remains unresolved and lowers data confidence.", image: "/visuals/signal-injury.svg", alt: "Editorial football injury-status graphic" }
];

const previewArticles = [
  { tag: "TOP GAMES", headline: "Sunday slate: the matchups that deserve the closest read", image: "/visuals/article-games.svg", alt: "Editorial Sunday NFL games graphic" },
  { tag: "INJURY REPORT", headline: "Late-week injury designations that can change the board", image: "/visuals/article-injury.svg", alt: "Editorial NFL injury report graphic" },
  { tag: "ROSTER WATCH", headline: "Role changes and transactions worth tracking before kickoff", image: "/visuals/article-roster.svg", alt: "Editorial NFL roster watch graphic" }
];

export default async function Home() {
  const { games } = await getNFLSlate();

  return (
    <main id="top">
      <div className="pageShell">
        <TopNav />
        <NFLTicker games={games} />

        <section className="hero">
          <p className="eyebrow">NFL DECISION INTELLIGENCE / WEEKLY SIGNAL DESK</p>
          <div className="heroGrid">
            <h1>KNOW WHAT<br />MATTERS<br /><span>BEFORE THE PLAY.</span></h1>
            <div className="heroCopy">
              <p>Structured evidence for the exact NFL play you are considering. No filler picks. No hidden uncertainty.</p>
              <a className="primaryButton" href="#analyze">Analyze Your Play</a>
            </div>
          </div>
        </section>

        <section className="section" id="picks">
          <div className="sectionHeader"><div><p className="sectionIndex">01</p><h2>OUR NFL PICKS</h2></div><p>Only plays that clear the signal threshold make the board.</p></div>
          <div className="pickGrid">
            {previewPicks.map((pick) => (
              <article className="pickCard" key={pick.matchup + pick.play}>
                <div className="cardTop"><span>{pick.matchup}</span><span className="signalPill">{pick.signal}</span></div>
                <h3>{pick.play}</h3>
                <div className="confidenceRow"><span>CONFIDENCE</span><strong>{pick.confidence}</strong></div>
                <p>Preview content. Slice 3 will replace this with scoring-engine output.</p>
                <a href="#analyze">View analysis</a>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="signals">
          <div className="sectionHeader"><div><p className="sectionIndex">02</p><h2>SIGNALS</h2></div><p>What changed, why it matters, and where uncertainty remains.</p></div>
          <div className="signalGrid">
            {previewSignals.map((signal) => (
              <article className="signalCard" key={signal.index}>
                <div className="signalVisual"><img src={signal.image} alt={signal.alt} /></div>
                <div className="signalCardBody">
                  <span className="signalNumber">{signal.index}</span>
                  <p className="signalType">{signal.title}</p>
                  <h3>{signal.copy}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="analyzeBand" id="analyze">
          <div><p className="eyebrow">YOUR PLAY / YOUR EVIDENCE</p><h2>BRING THE PLAY.<br />WE'LL BREAK DOWN THE SIGNAL.</h2></div>
          <PlayAnalyzer />
        </section>

        <section className="section" id="articles">
          <div className="sectionHeader"><div><p className="sectionIndex">03</p><h2>READ BEFORE KICKOFF</h2></div><p>Trusted reporting that can change the context around a play.</p></div>
          <div className="articleGrid">
            {previewArticles.map((article) => (
              <article className="articleCard" key={article.tag}>
                <div className="articleVisual"><img src={article.image} alt={article.alt} /><span>{article.tag}</span></div>
                <p className="articleSource">SOURCE LINK / COMING IN SLICE 3</p>
                <h3>{article.headline}</h3>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
