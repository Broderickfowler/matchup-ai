# MATCHUP//AI

**NFL decision intelligence for the exact play you are considering.**

MATCHUP//AI is a proof-of-concept sports intelligence application that helps an NFL fan or bettor evaluate a specific play using structured evidence, opposing signals, explicit data confidence, and an AI-assisted explanation.

The core principle is simple:

> **Code calculates. AI interprets and explains.**

Rather than asking an AI model to invent a prediction, MATCHUP//AI separates language understanding from scoring. Gemini interprets the user's natural-language play and explains the finished analysis, while deterministic application code owns feature selection, evidence weighting, confidence calculations, and the final numerical scores.

---

## What MATCHUP//AI Does

A user selects an NFL matchup and enters the exact play they are considering, for example:

```text
Patrick Mahomes over 300 passing yards
```

MATCHUP//AI then:

1. Interprets the natural-language play.
2. Converts it into a strict structured object.
3. Validates the player, team, market, direction, and line.
4. Selects evidence relevant to that specific market.
5. Calculates supporting and contradicting signals.
6. Separately calculates:
   - Signal Strength
   - Data Confidence
   - Final Confidence
7. Identifies the biggest risk and important missing inputs.
8. Uses Gemini to explain the deterministic evidence in plain language.

If a request is incomplete, MATCHUP//AI does not silently guess.

For example:

```text
Mahomes over 300
```

returns a clarification asking the user to specify the stat type instead of assuming passing yards.

---

## Why This Exists

Sports decisions often require information from multiple places:

- player production
- usage and role
- matchup context
- injury information
- team tendencies
- recent performance
- game environment
- external reporting

The problem is not always a lack of information. It is knowing **which information matters for the exact play being considered**.

MATCHUP//AI is designed to turn scattered context into an inspectable decision brief instead of producing a black-box pick.

---

## Product Experience

The proof of concept includes:

- bright editorial NFL intelligence homepage
- current NFL game ticker
- ranked qualifying NFL picks
- high-impact signal cards
- trusted external article links
- matchup selector
- natural-language play analysis
- visible structured interpretation
- supporting evidence
- contradicting evidence
- Signal Strength
- Data Confidence
- Final Confidence
- biggest-risk identification
- missing-data disclosure
- AI-assisted Why Now explanation
- AI-assisted Decision Brief
- Gemini model fallback handling

The homepage uses the same deterministic scoring logic as the play analyzer. Picks only appear when they clear the product's defined thresholds.

---

## Architecture

The main flow is:

```text
Raw data
   ↓
Normalized data
   ↓
Structured play
   ↓
Relevant feature selection
   ↓
Deterministic evidence scoring
   ↓
Signal Strength + Data Confidence
   ↓
Final Confidence
   ↓
Gemini explanation
   ↓
Decision Brief
```

### AI responsibilities

Gemini is allowed to:

- interpret natural-language play input
- return structured play data
- ask for clarification when required information is missing
- summarize supplied supporting and contradicting evidence
- generate the Why Now explanation
- generate the Decision Brief

Gemini is **not** allowed to:

- calculate Signal Strength
- calculate Data Confidence
- calculate Final Confidence
- invent missing players, teams, stats, or lines
- overwrite deterministic scores
- promise a win or guaranteed outcome

---

## Deterministic Scoring

Each available evidence signal contains:

- direction
- strength
- relevance
- recency
- presence / missing state

The scoring engine calculates weighted evidence using:

```text
weightedEvidence =
direction × strength × relevance × recency
```

The normalized directional signal is:

```text
netSignal =
Σ(weightedEvidence)
/
Σ(relevance × recency for present inputs)
```

Signal Strength is derived from the absolute magnitude of that result.

### Missing data

A key design decision is:

> **Missing data is unknown, not neutral.**

A missing input is excluded from directional scoring rather than converted to zero.

Missing important evidence instead lowers **Data Confidence**.

This prevents the application from treating "we do not know" as "nothing happened."

### Final Confidence

Final Confidence combines Signal Strength and Data Confidence using a harmonic mean.

That means a strong signal cannot hide poor data completeness, and complete data cannot hide a weak signal.

---

## Gemini Integration

MATCHUP//AI uses the Google GenAI SDK server-side.

Current model fallback order:

```text
gemini-3.6-flash
gemini-3.8-flash
gemini-3.5-flash-lite
```

The application can move to another supported model when a request fails because of a transient service condition such as rate limits or temporary model capacity.

The deterministic scoring layer remains unchanged regardless of which Gemini model handles parsing or explanation.

A connectivity diagnostic is available locally at:

```text
/api/ai-status
```

It reports whether Gemini is configured and reachable without exposing the API key.

---

## NFL Data Strategy

MATCHUP//AI uses a hybrid data architecture.

### Live context

The homepage ticker attempts to load current NFL schedule and score information through an ESPN-hosted scoreboard endpoint.

Because that endpoint is not treated as a guaranteed public developer contract, MATCHUP//AI isolates it behind an adapter and includes fallback behavior.

### Controlled analysis data

The deeper proof-of-concept analysis uses controlled local JSON datasets for:

- teams
- players
- injuries
- candidate plays
- articles
- fallback slate information
- verified final scores

This makes the scoring system reproducible and keeps the core analysis inspectable while proving the architecture before adding a commercial sports-data provider.

---

## Resilience and Failure Handling

The application includes several deliberate failure paths.

### Ambiguous play

Incomplete player props are rejected or clarified instead of guessed.

### Gemini unavailable

Supported deterministic analysis can fall back when Gemini is unavailable.

### Model capacity

The Gemini integration can move through the configured model fallback chain when a model is temporarily unavailable.

### Live NFL feed unavailable

The ticker can fall back to controlled slate data.

### Missing evidence

Missing values reduce Data Confidence and are displayed to the user.

### Stale game state

The ticker disables stale caching, polls for updated data, and can apply verified final-state overrides in the proof-of-concept dataset.

---

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Zod
- Google GenAI SDK
- Gemini
- local JSON data for the controlled analysis layer

---

## Run Locally

### Requirements

- Node.js 20+
- npm
- Gemini API key for live AI parsing and explanations

### Install

```bash
git clone https://github.com/Broderickfowler/matchup-ai.git
cd matchup-ai
npm install
```

### Configure Gemini

Create a local environment file:

```bash
touch .env.local
```

Add:

```text
GEMINI_API_KEY=your_private_key_here
```

Do not commit `.env.local` or a real API key.

### Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Verify Gemini

Open:

```text
http://localhost:3000/api/ai-status
```

A healthy configuration should report that Gemini is configured and reachable.

### Production build

```bash
npm run build
```

### Type check

```bash
npm run lint
```

---

## Example Inputs

Complete player prop:

```text
Patrick Mahomes over 300 passing yards
```

Incomplete player prop:

```text
Mahomes over 300
```

Team moneyline:

```text
KC moneyline
```

Spread:

```text
KC -3.5
```

Game total:

```text
game total over 47.5
```

The proof of concept currently supports:

- moneyline
- spread
- game total
- passing yards
- rushing yards
- receiving yards

---

## Devpost Learn AI Basics Skill Pack

MATCHUP//AI was structured using the Devpost Learn AI Basics Skill Pack.

The workflow helped separate the project into explicit planning, product, technical, implementation, and shipping stages.

### Scope

`devpost/scope.md`

Defines:

- target user
- user problem
- unique product kernel
- proof-of-concept boundary
- explicit non-goals
- learning objectives

### Product Requirements

`devpost/prd.md`

Defines:

- homepage experience
- NFL ticker
- ranked picks
- signals
- article experience
- play-analysis flow
- confidence presentation
- missing-data behavior
- product states and boundaries

### Technical Specification

`devpost/spec.md`

Defines:

- architecture
- data model
- Gemini responsibilities
- deterministic scoring responsibilities
- external dependencies
- failure modes
- hybrid sports-data strategy

### Build Checklist

`devpost/checklist.md`

Tracks the implementation as testable slices:

1. dashboard and ticker
2. deterministic play analysis
3. homepage scoring intelligence
4. Gemini parsing and explanation

### App Map

`devpost/app-map.html`

Provides a visual walkthrough of the finished architecture and the main learning path:

```text
Raw data
→ normalized data
→ derived signals
→ deterministic score
→ AI explanation
```

---

## What I Learned

The main technical learning goal was understanding how data handling and AI reasoning should work together.

The project reinforced several ideas:

- raw data should be normalized before reasoning
- structured types reduce ambiguity
- missing information must remain distinct from neutral information
- feature selection should depend on the decision being evaluated
- confidence should account for both signal strength and data completeness
- AI is valuable for language interpretation and explanation
- deterministic code is better for inspectable scoring rules
- external APIs need explicit fallback behavior
- AI model availability should not determine core business logic

The most reusable architectural lesson is:

> **Use AI where ambiguity is useful. Use deterministic code where consistency and auditability matter.**

---

## Current Proof-of-Concept Boundary

MATCHUP//AI currently:

- supports NFL only
- analyzes one selected matchup at a time
- uses controlled local data for deeper scoring
- supports a limited set of markets
- does not place bets
- does not connect to a sportsbook
- does not claim statistically calibrated win probability
- does not use complex predictive machine learning
- does not guarantee outcomes

The confidence scores represent the internal strength and completeness of the available evidence, not a guaranteed probability of winning.

---

## Future Direction

Potential next steps include:

- live player and team statistics
- commercial odds and market feeds
- additional prop markets
- additional sports
- historical backtesting
- saved analyses
- personalized signal models
- alerts when relevant evidence changes
- calibrated predictive models
- richer game-level intelligence

---

## Project Files

```text
app/
  api/
    ai-status/
    analyze/
    nfl/

components/
  ConfidenceMeter.tsx
  NFLTicker.tsx
  PlayAnalyzer.tsx
  ResultPanel.tsx
  TopNav.tsx

data/
  articles.json
  candidate-plays.json
  demo-slate.json
  injuries.json
  nfl-verified-results.json
  players.json
  teams.json

lib/
  ai/
    gemini.ts
  analysis/
    featureSelector.ts
    homepage.ts
    parseLocalPlay.ts
    score.ts
  nfl/
    adapter.ts
    fallback.ts
  schemas/
  types.ts

devpost/
  scope.md
  prd.md
  spec.md
  checklist.md
  app-map.html
```

---

## Disclaimer

MATCHUP//AI is an educational decision-intelligence proof of concept. It is not a sportsbook, does not execute wagers, and does not guarantee betting outcomes.

Users are responsible for their own decisions and for complying with applicable laws and platform rules.
