---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. The NFL intelligence dashboard runs with a live ticker and safe fallback**
  Becomes usable: A running bright editorial MATCHUP//AI homepage with navigation, the NFL ticker, visible Picks/Signals/Articles sections, and an Analyze Your Play entry point. The ticker tries live NFL schedule/score data and falls back to the demo slate if the feed fails.
  Why now: This proves the project boots, the visual identity is real, and the riskiest external homepage dependency is isolated before deeper analysis work lands.
  PRD ref: `prd.md > Screens and Layout > 1. NFL Intelligence Home`, `prd.md > Features and Behavior > NFL Ticker`, `prd.md > Look and Feel`
  Spec ref: `spec.md > App Shell and Navigation`, `spec.md > NFL Ticker`, `spec.md > NFL Data Adapter`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Scaffold Next.js 16 + TypeScript, add Zod, create the light editorial shell, add demo slate data, implement the NFL adapter and `/api/nfl`, render the ticker, and place the homepage section shells with realistic sample content.
  Verify (mechanical): In the available build harness, parse all TypeScript/TSX with the installed TypeScript parser, validate the fallback JSON shape, and statically verify the homepage/adapter contract. A full `npm run build` and live `/api/nfl` request remain part of the first hands-on runtime check because this container cannot reach npm or ESPN DNS.
  Learner check: Open the homepage and confirm the light editorial direction, ticker placement, and overall hierarchy match the sketch before deeper logic is added.
  Commit: `Build NFL dashboard shell and resilient ticker`

- [x] **2. A specific NFL play produces an explainable deterministic analysis**
  Becomes usable: A user can select a demo matchup, enter a supported play, click Analyze, see how MATCHUP//AI interpreted it, and receive signal direction, Signal Strength, Data Confidence, Final Confidence, supporting evidence, contradicting evidence, biggest risk, and a decision brief generated from local deterministic logic.
  Why now: This is the unique kernel of MATCHUP//AI and the main learning slice for data handling and AI-style reasoning. It arrives before secondary homepage polish.
  PRD ref: `prd.md > Screens and Layout > 2. Play Analysis`, `prd.md > Features and Behavior > Specific Play Entry`, `prd.md > Features and Behavior > Decision Intelligence Result`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Play Input`, `spec.md > Play Parser`, `spec.md > Feature Selector`, `spec.md > Scoring Engine`, `spec.md > Analysis Result`, `spec.md > Data Model`
  Build: Add the controlled player/team/injury datasets, schemas, local supported-play parser, feature selector, deterministic scoring engine, missing-data handling, `/api/analyze`, PlayAnalyzer, ConfidenceMeter, and ResultPanel. Use a local deterministic explanation fallback for this slice so the full kernel can be verified before Gemini is introduced.
  Verify (mechanical): Parse all TypeScript/TSX, then transpile and execute the pure parser → feature selector → scoring engine directly. Verify a Patrick Mahomes passing-yards example returns supporting and contradicting evidence with bounded confidence, and verify a Detroit moneyline example lowers Data Confidence and names the intentionally missing availability input. Full Next.js route execution remains deferred to the first package-enabled runtime.
  Learner check: Enter a supported NFL play and inspect both the visible "Understood As" interpretation and the evidence. Confirm the system feels like decision intelligence rather than a generic prediction.
  Commit: `Add deterministic play analysis engine`

- [ ] **3. Homepage picks and signals are generated from the same scoring logic**
  Becomes usable: The homepage stops being decorative: candidate plays are run through the scoring engine, only qualifying plays appear, 1 or 2 are shown when only 1 or 2 qualify, signal cards explain high-impact developments, and three trusted-source article cards link out to publishers.
  Why now: Reusing the same engine proves the product has one coherent intelligence system instead of separate hardcoded homepage recommendations.
  PRD ref: `prd.md > Features and Behavior > Our NFL Picks`, `prd.md > Features and Behavior > Signals`, `prd.md > Features and Behavior > Articles`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Our NFL Picks`, `spec.md > Signals`, `spec.md > Articles`, `spec.md > Scoring Engine`
  Build: Add candidate-play and article data, score and threshold candidate plays, rank qualifying results, derive homepage signal cards from controlled data, wire full analysis links/actions, and render the external article cards.
  Verify (mechanical): Run `npm run build`; run the candidate-play scoring path and confirm sub-threshold plays are excluded; confirm a slate with only two qualifying plays renders two rather than filler; validate all three article URLs are present and external.
  Learner check: Scan Our NFL Picks and Signals and confirm every visible recommendation feels earned by evidence, with no filler just to complete the layout.
  Commit: `Generate ranked picks signals and article cards`

- [ ] **4. Gemini handles structured play parsing and evidence-bound explanations with fallbacks**
  Becomes usable: With a Gemini key configured locally, natural-language supported plays are parsed into the strict schema and the deterministic result is explained in concise language. Without the key or during an API failure, the supported demo flow still works and is clearly identified as fallback behavior.
  Why now: The deterministic system is already proven, so AI can be added without letting it control scores or hide data problems.
  PRD ref: `prd.md > Features and Behavior > Specific Play Entry`, `prd.md > Features and Behavior > Decision Intelligence Result`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Play Parser`, `spec.md > Explanation Generator`, `spec.md > Important Failure Modes`, `spec.md > External Services and Dependencies`
  Build: Add the Google GenAI SDK, Gemini structured-output parser, semantic validation, evidence-only explanation prompt, environment configuration, fallback path, user-facing clarification/error states, and final responsive polish across the core journey.
  Verify (mechanical): Run `npm run build`; verify the no-key fallback path; with a locally configured key, POST a sample natural-language play and confirm Gemini output passes Zod validation and preserves the deterministic scores unchanged.
  Learner check: Try one clean play and one ambiguous play. Confirm the clean play produces a clear evidence-backed brief and the ambiguous one asks for clarification instead of guessing.
  Commit: `Add Gemini parsing explanations and resilient fallbacks`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after Slice 2, when the full deterministic core journey is working
- [ ] Final kick-the-tires exploration and feedback completed — after Slice 4

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: 
Route and stops: 
Edit outcome: 
Reflection: 
Activity mode: 

## Revisions

- Slice 3 implementation pushed to `main` at commit `31b43cb`: ranked homepage picks now come from the deterministic scoring engine, signals are derived from evidence, article cards link to current trusted NFL sources, and pick cards deep-link into the analyzer. Full `npm run build` remains to be confirmed on the learner's Mac because the build container cannot resolve GitHub/npm hosts.
- Learner feedback after Slice 2: Signals and Articles felt visually incomplete without images. Added local editorial SVG artwork to all three signal cards and all three article cards so the visual layer remains reliable without external image hosting. Learner confirmed the local app and deterministic analyzer work. Early checkpoint closed.
- Slice 2 framework-route verification used the same package/network workaround as Slice 1. The deterministic kernel itself was executed successfully outside Next.js, including two-sided evidence and the missing-data path.
- Slice 1 runtime verification was adapted because the build container cannot reach npm or ESPN DNS. TypeScript syntax, fallback data shape, and the homepage/adapter contract passed locally; full framework/runtime verification is deferred to the first environment with package/network access.
