"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { ResultPanel } from "@/components/ResultPanel";

const MATCHUPS = [
  { id: "kc-sea-2026-10-25", label: "KC @ SEA" },
  { id: "gb-det-2026-10-25", label: "GB @ DET" }
];

export function PlayAnalyzer() {
  const [matchupId, setMatchupId] = useState(MATCHUPS[0].id);
  const [text, setText] = useState("Patrick Mahomes over 275.5 passing yards");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMatchup = params.get("matchup");
    const requestedPlay = params.get("play");
    if (requestedMatchup && MATCHUPS.some((item) => item.id === requestedMatchup)) setMatchupId(requestedMatchup);
    if (requestedPlay) setText(requestedPlay);
  }, []);

  async function analyze() {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchupId, text }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Analysis failed.");
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="analyzerGrid">
      <div className="analyzerForm">
        <label>MATCHUP<select value={matchupId} onChange={(e) => setMatchupId(e.target.value)}>{MATCHUPS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>YOUR PLAY<textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} /></label>
        <p className="inputHint">Try: Patrick Mahomes over 275.5 passing yards, KC moneyline, KC -3.5, or game total over 47.5.</p>
        <button onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze Play"}</button>
        <p className="demoNote">POC MODE: deeper analysis currently uses a controlled demo dataset so every score is inspectable.</p>
        {error ? <p className="analyzerError">{error}</p> : null}
      </div>
      {result ? <ResultPanel result={result} /> : <div className="resultEmpty"><span>DECISION BRIEF</span><p>Your structured evidence will appear here.</p></div>}
    </div>
  );
}
