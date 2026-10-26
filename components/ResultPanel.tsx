import type { AnalysisResult, EvidenceSignal } from "@/lib/types";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";

function SignalList({ title, items }: { title: string; items: EvidenceSignal[] }) {
  return <div className="signalList"><h4>{title}</h4>{items.length ? items.map((item) => <div className="evidenceRow" key={item.id}><strong>{item.label}</strong><span>{item.detail}</span></div>) : <p>No strong signals in this direction.</p>}</div>;
}

export function ResultPanel({ result }: { result: AnalysisResult }) {
  return (
    <section className="resultPanel">
      <div className="resultTop"><span className={`resultSignal ${result.direction}`}>{result.direction.toUpperCase()}</span><span>{result.mode.toUpperCase()}{result.aiModel ? ` / ${result.aiModel.toUpperCase()}` : ""}</span></div>
      <p className="resultLabel">UNDERSTOOD AS</p>
      <h3>{result.play.player ? `${result.play.player} ${result.play.direction} ${result.play.threshold} ${result.play.stat?.replaceAll("_", " ")}` : result.play.originalText}</h3>
      <div className="meterGrid">
        <ConfidenceMeter label="SIGNAL STRENGTH" value={result.signalStrength} />
        <ConfidenceMeter label="DATA CONFIDENCE" value={result.dataConfidence} note={result.dataConfidenceLabel} />
        <ConfidenceMeter label="FINAL CONFIDENCE" value={result.finalConfidence} />
      </div>
      <div className="whyNow"><span>WHY NOW</span><p>{result.whyNow}</p></div>
      <div className="evidenceGrid"><SignalList title="SUPPORTING" items={result.supportingSignals} /><SignalList title="CONTRADICTING" items={result.contradictingSignals} /></div>
      <div className="riskBox"><span>BIGGEST RISK</span><p>{result.biggestRisk?.detail ?? "No strong contradicting signal is present in the available demo evidence."}</p></div>
      {result.missingInputs.length ? <div className="missingBox"><span>LIMITED EVIDENCE</span><p>Missing: {result.missingInputs.join(", ")}</p></div> : null}
      <div className="decisionBrief"><span>DECISION BRIEF</span><p>{result.decisionBrief}</p></div>
    </section>
  );
}
