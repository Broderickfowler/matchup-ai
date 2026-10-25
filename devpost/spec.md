---
doc: spec
status: draft
---

# MATCHUP//AI — Technical Spec

## How This Works, In Plain Language

MATCHUP//AI has two separate jobs:

1. **Bring in timely NFL context** for the homepage ticker and current slate.
2. **Analyze a specific play** using a controlled, explainable scoring system.

The app deliberately keeps those jobs separate.

Live schedule and score data feed the homepage through a small sports-data adapter. If that live source fails, the homepage falls back to a local demo slate so the product still works.

The deeper analysis does not depend on a live betting feed. For the proof of concept, team, player, matchup, injury, and candidate-play data live in controlled local JSON files. That lets us practice data cleaning, normalization, missing-value handling, feature selection, and scoring without making the demo dependent on a paid sports-data provider.

AI has two jobs only:

- turn the user's natural-language play into a structured object
- explain the deterministic evidence that the scoring engine already calculated

The AI does **not** invent the confidence score.

This implements the principle from `scope.md > The Unique Kernel`: **code calculates; AI interprets and explains.**

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. The user opens MATCHUP//AI.
2. The homepage asks the sports-data adapter for the current NFL slate.
3. The adapter tries the live scoreboard source.
4. If live data is unavailable or malformed, it returns the local demo slate instead.
5. The homepage renders the ticker, qualifying picks, signals, and article links.
6. The user chooses a matchup and enters a play such as "Patrick Mahomes over 275.5 passing yards."
7. The browser sends the matchup ID and natural-language play to the server-side analysis route.
8. Gemini parses that sentence into a strict structured play object.
9. The application validates the parsed object before using it.
10. The feature selector chooses the variables relevant to that market type.
11. The scoring engine reads normalized local NFL data and calculates supporting signals, opposing signals, signal strength, data confidence, final confidence, and biggest risk.
12. Gemini receives only the structured play plus the calculated evidence and turns it into a concise decision brief.
13. The user sees what MATCHUP//AI understood, what supports the play, what argues against it, the quality of the available data, and the final confidence.

## Stack

### Recommended application stack

- **Next.js 16.x + App Router**
  - One project can serve the visual interface and server-side API routes.
  - Current support status: Next.js 16.x is Active LTS.
  - Docs: https://nextjs.org/docs
  - Support policy: https://nextjs.org/support-policy

- **TypeScript**
  - Used across UI, adapters, validation, scoring, and API routes.
  - The main benefit for this project is catching mismatches between raw sports data, normalized data, parsed plays, and analysis output.

- **React via Next.js**
  - Used for the dashboard and analysis interface.

- **Zod**
  - Runtime validation for structured play objects and external data responses.
  - Docs: https://zod.dev/

- **Google GenAI SDK**
  - Server-side only.
  - Gemini structured output turns natural-language plays into predictable JSON.
  - Recommended model for the POC: `gemini-3.8-flash`, configurable through an environment variable so it can be changed without rewriting application logic.
  - Structured-output docs: https://ai.google.dev/gemini-api/docs/structured-output
  - Pricing: https://ai.google.dev/gemini-api/docs/pricing

### Tradeoff

This stack is slightly more structure than a single static page, but it gives the project clean boundaries for data handling and AI logic, which are the two learning goals. It also keeps API credentials off the browser.

**Learner approval still required:** Next.js + TypeScript + Gemini as the implementation stack. The hybrid data architecture itself is already approved.

## Where It Runs and How Someone Tries It

### Development

Requirements:

- Node.js 20+
- npm
- optional `GEMINI_API_KEY` for live AI parsing/explanation

Start:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

### Demo behavior without API keys

The application must still render the dashboard with local demo data.

If `GEMINI_API_KEY` is unavailable, the analysis route uses a clearly labeled local demo parser/explanation fallback for supported example plays. This fallback exists only to protect the demo from an external-service outage and must not be presented as live AI behavior.

### Optional deployment

Vercel is the preferred deployment target because the project is Next.js-based.

Deployment is optional for Devpost. The required deliverables remain the public GitHub repository and demo video.

## Look and Feel

Implements `prd.md > Look and Feel`.

Direction: **bright editorial sports intelligence**.

- Main canvas: warm off-white or very light blue-gray
- Primary text: black / near-black
- Primary interaction and data accent: medium electric blue
- Structural secondary: deep navy
- Supporting neutral: soft gray
- Favorable, caution, and risk states may use restrained semantic accents without turning the interface into a casino palette
- Large editorial headlines paired with compact data typography
- Strong card structure, generous spacing, fast scanning
- No generic chatbot shell
- No black sportsbook dashboard
- No casino-style glow, chips, or betting-table visual language

Working palette:

- Canvas: `#F3F5F7`
- Ink: `#111111`
- Electric Blue: `#246BFD`
- Deep Navy: `#102A43`
- Soft Gray: `#D9DEE5`

Exact shades can be adjusted during implementation while preserving the light editorial identity.

## Components

### App Shell and Navigation

Implements `prd.md > Screens and Layout > NFL Intelligence Home`.

Responsibilities:

- MATCHUP//AI wordmark
- Home, NFL Picks, Signals, Articles, Analyze Play anchors/actions
- consistent page width and spacing
- responsive layout

### NFL Ticker

Implements `prd.md > Features and Behavior > NFL Ticker`.

Responsibilities:

- ask the NFL data adapter for the current slate
- render teams, kickoff time, score, and status
- horizontally scroll on smaller screens
- show whether the data came from live or fallback mode only in development/debug metadata, not as visual clutter

### NFL Data Adapter

Implements `prd.md > Features and Behavior > NFL Ticker`.

Primary POC source:

```text
GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=YYYYMMDD
```

No API key is currently required for this public ESPN-hosted endpoint, but it is an undocumented/unsupported interface rather than a guaranteed public developer contract.

Adapter behavior:

1. fetch live JSON server-side
2. validate the response shape
3. map it into the internal `Game` schema
4. if fetch, validation, or mapping fails, load `data/demo-slate.json`

The rest of MATCHUP//AI never reads ESPN-shaped objects directly.

### Our NFL Picks

Implements `prd.md > Features and Behavior > Our NFL Picks`.

Responsibilities:

- load a small local set of candidate plays for the current demo slate
- score each candidate with the same scoring engine used for user-entered plays
- retain only candidates that clear the POC qualification thresholds
- sort by final confidence
- render at most five
- render only one or two if only one or two qualify
- show "No strong signals right now" if none qualify

Initial POC qualification thresholds:

- signal strength >= 65
- data confidence >= 60
- final confidence >= 65

These are product heuristics for the demo, not claims of predictive calibration.

### Signals

Implements `prd.md > Features and Behavior > Signals`.

Responsibilities:

- derive a small set of high-impact signal cards from the controlled dataset
- each signal contains a fact, signal type, affected team/player, relevance score, and short impact statement
- prioritize high relevance and recency
- do not act as a generic news feed

### Articles

Implements `prd.md > Features and Behavior > Articles`.

Responsibilities:

- render three curated external article cards
- article metadata lives in `data/articles.json`
- each record includes source, headline, category, URL, and short context line
- initial categories:
  - Top Games for Sunday
  - Injury Report
  - Roster Changes
- opening a card sends the user to the original publisher

For the POC, article selection is manually curated rather than building a news-ingestion pipeline.

### Play Input

Implements `prd.md > Features and Behavior > Specific Play Entry`.

Responsibilities:

- matchup selector
- free-text play input
- Analyze action
- input examples
- loading and validation states

Supported V1 markets:

- moneyline
- spread
- game total
- passing yards
- rushing yards
- receiving yards

### Play Parser

Implements `prd.md > Features and Behavior > Specific Play Entry`.

Server-side route:

```text
POST /api/parse-play
```

Input:

```json
{
  "matchupId": "kc-sea-2026-10-25",
  "text": "Patrick Mahomes over 275.5 passing yards"
}
```

Target structured output:

```json
{
  "sport": "NFL",
  "marketType": "player_prop",
  "player": "Patrick Mahomes",
  "stat": "passing_yards",
  "direction": "over",
  "threshold": 275.5,
  "team": "KC",
  "opponent": "SEA"
}
```

The Gemini response must use structured JSON output and then pass local Zod validation.

If semantic validation fails, the route returns a clarification response rather than silently guessing.

### Feature Selector

Implements `prd.md > Features and Behavior > Decision Intelligence Result`.

Responsibilities:

- map the parsed market/stat to the variables that actually matter
- example: rushing-yards props use recent carries, yards per carry, snap share, opponent rushing defense, injury context, and role trend
- different market types receive different feature sets
- return a list of expected inputs with relevance weights

This component is central to the learner's AI-logic goal: the app must decide which data matters before scoring it.

### Scoring Engine

Implements `prd.md > Features and Behavior > Decision Intelligence Result`.

The scoring engine is deterministic TypeScript, not LLM reasoning.

Each evidence item has:

```text
direction   = +1 support, 0 neutral, -1 oppose
strength    = 0..1
relevance   = 0..1
recency     = 0..1
present     = true | false
```

For present evidence:

```text
weightedEvidence = direction × strength × relevance × recency
```

Aggregate net signal:

```text
netSignal =
sum(weightedEvidence)
/
sum(relevance × recency for present evidence)
```

Then:

```text
signalStrength = abs(netSignal) × 100
```

Direction:

- netSignal > 0.15 → Favorable
- netSignal < -0.15 → Unfavorable
- otherwise → Mixed

Data confidence:

```text
dataConfidence =
weighted expected inputs present
/
weighted expected inputs total
× 100
```

Missing data is not assigned a zero-value signal. It is excluded from evidence and lowers data confidence.

Final confidence uses the harmonic mean of signal strength and data confidence:

```text
finalConfidence =
2 × signalStrength × dataConfidence
/
(signalStrength + dataConfidence)
```

This choice intentionally makes a low value in either dimension pull down the final confidence.

### Explanation Generator

Implements `prd.md > Features and Behavior > Decision Intelligence Result`.

Server-side route:

```text
POST /api/explain
```

Gemini receives:

- the validated structured play
- calculated direction
- signal strength
- data confidence
- final confidence
- strongest supporting signals
- strongest contradicting signals
- biggest risk
- missing high-relevance inputs

Gemini is asked to produce only:

- Why Now
- concise supporting explanations
- concise contradicting explanations
- biggest-risk wording
- Decision Brief

It is explicitly instructed not to change numeric scores or invent facts outside the supplied evidence.

### Analysis Result

Implements `prd.md > Features and Behavior > Decision Intelligence Result`.

The UI presents:

- Your Play
- Understood As
- Signal
- Signal Strength
- Data Confidence
- Final Confidence
- Why Now
- Strongest Signals
- Contradicting Signals
- Biggest Risk
- missing-data note when applicable
- Decision Brief

## Data Model

### Game

```ts
type Game = {
  id: string;
  dateTime: string;
  status: "scheduled" | "live" | "final";
  awayTeam: TeamRef;
  homeTeam: TeamRef;
  awayScore: number | null;
  homeScore: number | null;
};
```

### TeamRef

```ts
type TeamRef = {
  id: string;
  abbreviation: string;
  name: string;
};
```

### ParsedPlay

```ts
type ParsedPlay = {
  sport: "NFL";
  marketType: "moneyline" | "spread" | "game_total" | "player_prop";
  player: string | null;
  stat: "passing_yards" | "rushing_yards" | "receiving_yards" | null;
  direction: "over" | "under" | "team";
  threshold: number | null;
  team: string;
  opponent: string;
};
```

### EvidenceSignal

```ts
type EvidenceSignal = {
  id: string;
  label: string;
  value: number | string | null;
  direction: -1 | 0 | 1;
  strength: number;
  relevance: number;
  recency: number;
  present: boolean;
  sourceLabel: string;
};
```

### AnalysisResult

```ts
type AnalysisResult = {
  play: ParsedPlay;
  direction: "favorable" | "mixed" | "unfavorable";
  signalStrength: number;
  dataConfidence: number;
  finalConfidence: number;
  supportingSignals: EvidenceSignal[];
  contradictingSignals: EvidenceSignal[];
  missingInputs: string[];
  biggestRisk: EvidenceSignal | null;
  whyNow: string;
  decisionBrief: string;
};
```

No user data needs to persist for V1. Refreshing the page can reset the analysis.

## File Structure

```text
matchup-ai/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts         # orchestrates parse → score → explain
│   │   ├── parse-play/
│   │   │   └── route.ts         # structured Gemini parsing
│   │   └── nfl/
│   │       └── route.ts         # normalized live ticker data
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # dashboard + analysis entry/result
├── components/
│   ├── ArticleCards.tsx
│   ├── ConfidenceMeter.tsx
│   ├── NFLTicker.tsx
│   ├── PicksGrid.tsx
│   ├── PlayAnalyzer.tsx
│   ├── ResultPanel.tsx
│   ├── SignalCard.tsx
│   └── TopNav.tsx
├── data/
│   ├── articles.json            # curated external links
│   ├── candidate-plays.json     # demo picks evaluated by the engine
│   ├── demo-slate.json          # fallback schedule
│   ├── injuries.json            # controlled POC injury context
│   ├── players.json             # controlled player metrics
│   └── teams.json               # controlled team metrics
├── lib/
│   ├── ai/
│   │   ├── explain.ts
│   │   └── parsePlay.ts
│   ├── nfl/
│   │   ├── adapter.ts           # live source → internal Game[]
│   │   └── fallback.ts
│   ├── analysis/
│   │   ├── featureSelector.ts
│   │   ├── normalize.ts
│   │   ├── score.ts
│   │   └── thresholds.ts
│   ├── schemas/
│   │   ├── analysis.ts
│   │   ├── game.ts
│   │   └── play.ts
│   └── types.ts
├── devpost/
│   ├── prd.md
│   ├── scope.md
│   └── spec.md
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── tsconfig.json
```

## External Services and Dependencies

### Gemini Developer API

Purpose:

- parse natural-language play into strict JSON
- explain deterministic analysis results

Authentication:

```text
GEMINI_API_KEY
```

The key is server-side only.

Structured-output documentation:

https://ai.google.dev/gemini-api/docs/structured-output

Pricing documentation:

https://ai.google.dev/gemini-api/docs/pricing

Current Gemini developer documentation describes a free tier for eligible models/projects. Availability and rate limits can vary, so the build must not assume unlimited requests.

### ESPN-hosted NFL scoreboard endpoint

Purpose:

- homepage schedule, score, kickoff time, and status

POC request:

```text
GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=YYYYMMDD
```

Authentication:

- none currently required

Important limitation:

This is an ESPN-hosted endpoint commonly used by ESPN web clients, but it is not a supported public developer API contract. The adapter and local fallback exist specifically so this dependency can fail without breaking the demo.

Community endpoint reference:

https://github.com/pseudo-r/Public-NFL-API/blob/main/docs/game_endpoints.md

### External article publishers

The POC stores article URLs and metadata locally and sends users to the original source. It does not scrape or republish full article content.

## Important Failure Modes

- **Live scoreboard source fails or changes shape** → the NFL adapter returns `demo-slate.json`, and the rest of the homepage continues to work.
- **Gemini request fails, rate-limits, or has no API key** → supported demo inputs use the clearly labeled local demo parser/explanation fallback; unsupported inputs show that AI analysis is temporarily unavailable rather than fabricating a result.
- **Gemini parses a play into valid JSON with the wrong meaning** → local semantic checks compare the parsed team/player/stat against the selected matchup and supported market list; ambiguous inputs ask the user to clarify.
- **A high-relevance input is missing** → the scoring engine excludes it from evidence, lowers Data Confidence, and the result names the missing input.

## What Was Simplified and Why

- **Controlled local analysis data** instead of a paid real-time player-prop/statistics feed — this protects the 2–4 hour POC and makes the normalization/scoring logic inspectable.
- **Small candidate-play list** instead of generating every possible NFL market — enough to prove that MATCHUP//AI can rank and filter plays without building a sportsbook data platform.
- **Curated article metadata** instead of a news ingestion/classification pipeline — the product only needs to prove the editorial gateway.
- **No database** — V1 has no accounts, history, or saved analyses.
- **One page with progressive analysis** instead of multiple deep game pages — keeps the core journey demoable in under a minute.
- **Uncalibrated heuristic confidence** instead of claiming predictive probability — V1 demonstrates explainable reasoning, not statistically validated betting performance.

## Decisions and Open Issues

### Approved decisions

- **Hybrid data architecture** — live schedule/score context plus controlled local analysis data. This reduces external dependency risk while preserving a genuinely live surface.
- **NFL only** — keeps feature selection and normalization coherent.
- **Missing means unknown** — missing data lowers Data Confidence and is never silently converted to neutral evidence.
- **Code calculates; AI explains** — scoring remains deterministic and inspectable.

### Learning uncertainty clarified

The project needs to distinguish a missing value from a neutral value.

For example:

```text
injury impact = 0
```

means the system has evidence of no impact.

```text
injury impact = null
```

means the system does not know the impact.

The build will practice preserving that distinction through raw data, normalization, feature selection, and scoring. Evidence of this learning should be visible in the schemas and scoring tests.

### Pending learner approval

- **Implementation stack:** Next.js 16 + TypeScript + Zod + Google GenAI SDK using a configurable Gemini Flash model.
