import { NFLTicker } from "@/components/NFLTicker";
import { TopNav } from "@/components/TopNav";
import { PlayAnalyzer } from "@/components/PlayAnalyzer";
import { getNFLSlate } from "@/lib/nfl/adapter";
import { getHomepageIntelligence } from "@/lib/analysis/homepage";

export default async function Home() {
  const { games } = await getNFLSlate();
  const { picks, signals, articles } = getHomepageIntelligence();

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
          {picks.length ? (
            <div className="pickGrid">
              {picks.map((pick) => (
                <article className="pickCard" key={pick.matchupId + pick.text}>
                  <div className="cardTop"><span>{pick.matchup}</span><span className="signalPill">{pick.result.direction.toUpperCase()}</span></div>
                  <h3>{pick.text}</h3>
                  <div className="confidenceRow"><span>FINAL CONFIDENCE</span><strong>{pick.result.finalConfidence}</strong></div>
                  <div className="pickMetrics"><span>Signal {pick.result.signalStrength}</span><span>Data {pick.result.dataConfidence}</span></div>
                  <p>{pick.result.whyNow}</p>
                  <a href={`/?matchup=${encodeURIComponent(pick.matchupId)}&play=${encodeURIComponent(pick.text)}#analyze`}>View full analysis</a>
                </article>
              ))}
            </div>
          ) : <div className="noPicks"><strong>NO STRONG SIGNALS RIGHT NOW.</strong><p>The current candidate slate does not clear MATCHUP//AI's minimum signal and data-confidence thresholds.</p></div>}
        </section>

        <section className="section" id="signals">
          <div className="sectionHeader"><div><p className="sectionIndex">02</p><h2>SIGNALS</h2></div><p>What changed, why it matters, and where uncertainty remains.</p></div>
          <div className="signalGrid">
            {signals.map((signal) => (
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
            {articles.map((article) => (
              <a className="articleCard" key={article.url} href={article.url} target="_blank" rel="noreferrer">
                <div className="articleVisual"><img src={article.image} alt={article.alt} /><span>{article.category}</span></div>
                <p className="articleSource">{article.source} / {article.published}</p>
                <h3>{article.headline}</h3>
                <span className="articleCta">Read source ↗</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
