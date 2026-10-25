import type { AnalysisDirection, AnalysisResult, EvidenceSignal, ParsedPlay } from "@/lib/types";

function weightedMagnitude(item: EvidenceSignal) {
  return item.strength * item.relevance * item.recency;
}

export function scorePlay(play: ParsedPlay, evidence: EvidenceSignal[]): AnalysisResult {
  const present = evidence.filter((item) => item.present);
  const weightedEvidence = present.reduce((sum, item) => sum + item.direction * weightedMagnitude(item), 0);
  const denominator = present.reduce((sum, item) => sum + item.relevance * item.recency, 0);
  const netSignal = denominator === 0 ? 0 : weightedEvidence / denominator;
  const signalStrength = Math.round(Math.abs(netSignal) * 100);
  const direction: AnalysisDirection = netSignal > 0.15 ? "favorable" : netSignal < -0.15 ? "unfavorable" : "mixed";

  const expectedWeight = evidence.reduce((sum, item) => sum + item.relevance, 0);
  const presentWeight = present.reduce((sum, item) => sum + item.relevance, 0);
  const dataConfidence = Math.round(expectedWeight === 0 ? 0 : (presentWeight / expectedWeight) * 100);
  const finalConfidence = Math.round(signalStrength + dataConfidence === 0 ? 0 : (2 * signalStrength * dataConfidence) / (signalStrength + dataConfidence));
  const dataConfidenceLabel = dataConfidence >= 85 ? "High" : dataConfidence >= 65 ? "Moderate" : "Limited";

  const supportingSignals = present.filter((item) => item.direction > 0).sort((a, b) => weightedMagnitude(b) - weightedMagnitude(a)).slice(0, 3);
  const contradictingSignals = present.filter((item) => item.direction < 0).sort((a, b) => weightedMagnitude(b) - weightedMagnitude(a)).slice(0, 3);
  const missingInputs = evidence.filter((item) => !item.present).map((item) => item.label);
  const biggestRisk = contradictingSignals[0] ?? null;
  const strongest = supportingSignals[0] ?? contradictingSignals[0] ?? null;

  const whyNow = strongest ? `${strongest.label} is the highest-weight current signal in this analysis.` : "No single signal currently dominates the analysis.";
  const decisionBrief = direction === "favorable"
    ? `The available evidence leans in favor of this play, but the confidence level should be read together with Data Confidence${missingInputs.length ? " because some inputs are missing" : ""}.`
    : direction === "unfavorable"
      ? "The available evidence leans against this play. The strongest opposing signals outweigh the current supporting evidence."
      : "The evidence is mixed. Supporting and opposing signals are too balanced for a strong directional conclusion.";

  return {
    play, direction, signalStrength, dataConfidence, dataConfidenceLabel, finalConfidence,
    supportingSignals, contradictingSignals, missingInputs, biggestRisk, whyNow, decisionBrief,
    mode: "demo-deterministic"
  };
}
