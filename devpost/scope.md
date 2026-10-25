---
doc: scope
status: draft
---

# MATCHUP//AI

One line: NFL decision intelligence that evaluates a specific play using structured evidence, opposing signals, and an explainable confidence brief.

## The Unique Kernel
MATCHUP//AI does not simply predict a winner or generate a pick. The user enters the exact play they are considering, and the system identifies which variables matter for that play, weighs evidence for and against it, and explains the result.

The product principle is: **code calculates; AI interprets and explains.**

## Who It's For
An NFL fan or sports bettor who already has a specific play in mind but is trying to determine which information actually matters before making a decision.

Today, that person may bounce between stats pages, injury reports, recent games, matchup commentary, and opinions without a clear way to connect the evidence to the exact play they are considering.

## The Core Loop
The user selects an upcoming NFL matchup, enters a specific play, and requests an analysis. MATCHUP//AI parses the play, selects relevant variables, evaluates supporting and contradicting signals, and returns a concise decision brief.

The user comes back because each new matchup or play can require a different evidence set.

## Inspiration & Identity
The experience should feel like decision intelligence rather than a generic chatbot: clear, analytical, fast, and visually structured around signal, evidence, confidence, and risk.

## Why This Matters to the Learner
The learner wants to get better at data handling and building AI logic. This project provides a concrete way to practice converting raw sports data into structured inputs, derived signals, and AI explanations without hiding the whole system behind one prompt.

## What "Working" Looks Like
A user can select an NFL matchup, enter a specific play such as a spread, total, moneyline, passing-yards prop, rushing-yards prop, or receiving-yards prop, and click Analyze.

The compelling demo moment is seeing the user's natural-language play converted into structured data and then receiving a result that shows both the strongest supporting evidence and the strongest contradicting evidence, along with a confidence score and a concise decision brief.

## The POC Boundary
In scope now:

- NFL only
- One upcoming matchup at a time
- User-entered specific play
- Structured play parsing
- A small set of relevant team/player signals
- Deterministic signal scoring
- Supporting evidence
- Contradicting evidence
- Biggest risk
- Confidence score
- AI-written explanation based on calculated evidence

## Later
- Additional sports
- More prop-market types
- Live odds feeds
- User accounts and saved analyses
- Historical backtesting
- Personalized models
- Alerts and monitoring
- Advanced machine-learning prediction models

## Explicitly Cut
- Multi-sport support, because it would expand the data model beyond the proof of concept.
- Full sportsbook integration, because the goal is decision intelligence, not bet placement.
- Complex predictive ML, because V1 should make the reasoning understandable and traceable.
- Autonomous wagering or automatic bet execution, because it is unnecessary to prove the core idea.
