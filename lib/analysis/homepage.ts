import candidatePlays from "@/data/candidate-plays.json";
import articles from "@/data/articles.json";
import demoSlate from "@/data/demo-slate.json";
import injuries from "@/data/injuries.json";
import players from "@/data/players.json";
import teams from "@/data/teams.json";
import { parseLocalPlay } from "@/lib/analysis/parseLocalPlay";
import { scorePlay } from "@/lib/analysis/score";
import { selectFeatures } from "@/lib/analysis/featureSelector";
import type { AnalysisResult, EvidenceSignal } from "@/lib/types";

const PICK_THRESHOLDS = {
  signalStrength: 65,
  dataConfidence: 60,
  finalConfidence: 65
};

type EvaluatedCandidate = {
  matchupId: string;
  matchup: string;
  text: string;
  result: AnalysisResult;
};

function impact(signal: EvidenceSignal) {
  return signal.strength * signal.relevance * signal.recency;
}

function labelFor(signal: EvidenceSignal) {
  if (signal.id === "usage" || signal.id === "role" || signal.id === "baseline") return "ROLE / USAGE";
  if (signal.id === "matchup" || signal.id === "power") return "MATCHUP";
  if (signal.id === "injury" || signal.id === "availability") return "INJURY";
  return "SIGNAL";
}

function imageFor(label: string) {
  if (label === "ROLE / USAGE") return "/visuals/signal-role.svg";
  if (label === "MATCHUP") return "/visuals/signal-matchup.svg";
  return "/visuals/signal-injury.svg";
}

function evaluateCandidates(): EvaluatedCandidate[] {
  return candidatePlays.flatMap((candidate) => {
    const game = demoSlate.find((item) => item.id === candidate.matchupId);
    if (!game) return [];

    const parsed = parseLocalPlay(
      candidate.text,
      { id: game.id, away: game.awayTeam.abbreviation, home: game.homeTeam.abbreviation },
      players
    );
    if (!parsed) return [];

    const evidence = selectFeatures(parsed, teams, players, injuries);
    if (!evidence.length) return [];

    return [{
      matchupId: candidate.matchupId,
      matchup: `${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`,
      text: candidate.text,
      result: scorePlay(parsed, evidence)
    }];
  });
}

function deriveSignals(evaluated: EvaluatedCandidate[]) {
  const allSupport = evaluated
    .flatMap((candidate) => candidate.result.supportingSignals)
    .sort((a, b) => impact(b) - impact(a));

  const allOpposition = evaluated
    .flatMap((candidate) => candidate.result.contradictingSignals)
    .sort((a, b) => impact(b) - impact(a));

  const missing = evaluated.find((candidate) => candidate.result.missingInputs.length)?.result.missingInputs[0];

  const cards = [];

  if (allSupport[0]) {
    const label = labelFor(allSupport[0]);
    cards.push({
      index: "01",
      title: label,
      copy: allSupport[0].detail,
      image: imageFor(label),
      alt: `Editorial ${label.toLowerCase()} football signal graphic`
    });
  }

  if (allOpposition[0]) {
    const label = labelFor(allOpposition[0]);
    cards.push({
      index: "02",
      title: label,
      copy: allOpposition[0].detail,
      image: imageFor(label),
      alt: `Editorial ${label.toLowerCase()} football signal graphic`
    });
  }

  if (missing) {
    cards.push({
      index: "03",
      title: "DATA GAP",
      copy: `${missing} is unavailable in the controlled dataset, so Data Confidence is reduced instead of treating the missing input as neutral.`,
      image: "/visuals/signal-injury.svg",
      alt: "Editorial football data-confidence graphic"
    });
  }

  return cards.slice(0, 3);
}

export function getHomepageIntelligence() {
  const evaluated = evaluateCandidates();

  const picks = evaluated
    .filter(({ result }) =>
      result.direction === "favorable" &&
      result.signalStrength >= PICK_THRESHOLDS.signalStrength &&
      result.dataConfidence >= PICK_THRESHOLDS.dataConfidence &&
      result.finalConfidence >= PICK_THRESHOLDS.finalConfidence
    )
    .sort((a, b) => b.result.finalConfidence - a.result.finalConfidence)
    .slice(0, 5);

  return {
    picks,
    signals: deriveSignals(evaluated),
    articles,
    evaluatedCount: evaluated.length
  };
}
