---
doc: prd
status: approved
---

# MATCHUP//AI — Product Requirements

One line: a bright, editorial NFL decision-intelligence dashboard that surfaces the strongest plays of the day and lets a user analyze a specific play using structured evidence, opposing signals, and explainable confidence.

Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, and `scope.md > What "Working" Looks Like`.

## The Core Journey

1. The user opens MATCHUP//AI and lands on an NFL intelligence dashboard.
2. At the top, they see navigation followed immediately by an NFL ticker showing the day's games, scheduled times, live scores when available, and game status.
3. The homepage presents **Our NFL Picks**, a curated set of the 3–5 strongest plays identified automatically by MATCHUP//AI's scoring logic.
4. The user can scan a **Signals** section highlighting the most important injuries, role changes, matchup tendencies, usage changes, or other factors affecting the current slate.
5. The user can open one of three editorial article cards linking primarily to trusted external NFL reporting such as ESPN, NFL.com, or similar sources. The cards focus on major Sunday games, injury reporting, and roster changes.
6. A clear **Analyze Your Play** action lets the user select a matchup and enter the specific play they are considering.
7. MATCHUP//AI interprets that play and presents the structured version of what it understood.
8. The system evaluates relevant evidence and returns a decision brief showing signal direction, confidence, supporting evidence, contradicting evidence, what changed recently, and the biggest risk.
9. The user leaves with a clearer understanding of the evidence behind the play rather than only a prediction.

Source: `scope.md > The Core Loop`.

## Screens and Layout

### 1. NFL Intelligence Home

The landing page is a vertically structured dashboard:

**Top navigation**
- MATCHUP//AI wordmark
- Home
- NFL Picks
- Signals
- Articles
- Analyze Play

**NFL ticker**
- Horizontal game strip directly beneath navigation
- Away and home team
- Scheduled kickoff time for upcoming games
- Score and game status for live or completed games
- Designed for quick scanning

**Our NFL Picks**
- Primary homepage content block
- 3–5 strongest plays only
- Picks are selected automatically by MATCHUP//AI rather than manually curated
- Each card shows:
  - matchup
  - specific play
  - signal direction
  - confidence score
  - strongest supporting factors
  - biggest risk
  - View Full Analysis action

**Signals**
- Compact intelligence cards for the most meaningful developments affecting the slate
- Examples may include injury, player usage, defensive matchup, expected game script, or roster-role change
- Each card emphasizes why the signal matters, not merely the raw fact

**Articles**
- Three editorial cards
- Primarily link to existing trusted reporting
- Initial editorial categories:
  - Top Games for Sunday
  - Injury Report
  - Roster Changes
- Each card includes source, headline, short context, and Read More action

**Analyze Your Play**
- Highly visible call to action on the homepage
- Leads directly into the analysis interaction

### 2. Play Analysis

The user sees:
- selected NFL matchup
- natural-language play input
- Analyze action

After submission, the same surface reveals:

**Your Play**
- Exact play entered by the user

**Understood As**
- Human-readable structured interpretation so the user can verify MATCHUP//AI understood the play correctly

**Signal**
- Favorable
- Mixed
- Unfavorable

**Signal Strength**
- How strongly the available evidence supports or opposes the play

**Data Confidence**
- High, Moderate, or Limited based on completeness and reliability of the available inputs

**Confidence**
- 0–100 final confidence score that accounts for both signal strength and data completeness

**Why Now**
- Most important recent development affecting the analysis

**Strongest Signals**
- Up to three high-value pieces of supporting evidence

**Contradicting Signals**
- Up to three meaningful pieces of evidence against the play

**Biggest Risk**
- The single factor most capable of weakening or invalidating the analysis

**Decision Brief**
- Concise plain-language explanation of what the evidence means for the user's decision

Source: `scope.md > What "Working" Looks Like`.

## Look and Feel

MATCHUP//AI should deliberately avoid the dominant dark sportsbook aesthetic.

The selected direction is **bright editorial sports intelligence**:

- light or off-white / very light blue-gray main canvas
- black or near-black typography
- medium electric blue as the primary data and interaction accent
- deep navy as a structural secondary color
- strong modular cards
- large, sharp editorial headlines
- compact, clean data typography
- generous white space
- high contrast
- sports-broadcast information density without sportsbook clutter
- no generic chatbot layout
- no casino-style visual language

The product should feel closer to a premium sports publication crossed with a professional intelligence terminal.

Source: `scope.md > Inspiration & Identity`.

## Features and Behavior

### NFL Ticker

- Displays the current NFL slate relevant to the day.
- Upcoming games show kickoff time.
- Live games show score and status.
- Completed games show final score and status.
- The ticker prioritizes readability and fast scanning over detailed box-score information.

### Our NFL Picks

- MATCHUP//AI automatically evaluates candidate plays for the current slate.
- The homepage surfaces only the strongest 3–5 plays.
- A play must earn placement through the system's scoring logic rather than simply representing every game.
- Each visible pick provides enough evidence to understand why it surfaced.
- Selecting a pick opens its fuller analysis.

Source: `scope.md > The Unique Kernel`.

### Signals

- Surfaces high-impact developments affecting current NFL games or plays.
- Signals should connect a raw fact to its potential impact.
- Signal cards prioritize relevance and recency.
- The section is not a general news feed.

### Articles

- Displays three relevant external articles.
- The initial categories are Sunday top games, injury reporting, and roster changes.
- Cards primarily link to trusted external reporting rather than generating replacement articles.
- MATCHUP//AI may provide a short context line, but does not present generated content as original reporting.

### Specific Play Entry

- A user selects a matchup and enters a play in natural language.
- Examples include:
  - team moneyline
  - spread
  - game total
  - passing yards
  - rushing yards
  - receiving yards
- Before analysis, the product makes its interpretation visible enough for the user to catch a misunderstanding.

### Decision Intelligence Result

- The result must show both evidence supporting and evidence contradicting the user's play.
- Signal strength, data confidence, and final confidence must be presented separately so the user can distinguish strong evidence from incomplete evidence.
- The product must identify the biggest risk rather than hide conflicting information.
- The result should help the user understand a decision, not merely hand them a pick.

## States and Boundaries

- **First use** — homepage contains the day's NFL slate, strongest available picks, current signals, article links, and a clear Analyze Your Play action.
- **Normal analysis** — the user's play is understood and an evidence-based result is displayed.
- **Unclear play input** — MATCHUP//AI should not silently guess when the play cannot be interpreted with reasonable confidence. The user should be prompted to clarify the play.
- **No strong homepage picks** — the product shows only plays that clear the system threshold. If only 1 or 2 plays qualify, only those 1 or 2 appear. If none qualify, the section shows a clear "No strong signals right now" state.
- **Missing data** — the result must visibly identify incomplete evidence. Missing information is treated as unknown, not neutral. The interface shows a Data Confidence state such as High, Moderate, or Limited and names the important missing inputs.
- **External articles** — opening an article takes the user to the original publisher.

## Product Decisions

- NFL is the only sport in V1 to keep the data model and reasoning focused.
- Users can enter a specific play rather than only compare teams because the product is meant to support an actual decision.
- Homepage picks are selected automatically by MATCHUP//AI based on scoring logic.
- Only plays that clear the system threshold should appear. The section may contain just 1 or 2 plays when only those qualify.
- External reporting is preferred for the article cards in V1.
- The visual identity uses a bright background, black typography, electric/medium blue accents, and deep navy structure rather than the common black sportsbook interface.
- The product exposes evidence on both sides of a play instead of only promoting a recommendation.
- Missing data is displayed explicitly through a Data Confidence state rather than silently treated as neutral evidence.

## What We're Building

The proof of concept must demonstrate:

- NFL homepage
- navigation
- daily game ticker
- 3–5 strongest MATCHUP//AI picks
- current signal cards
- three external article cards
- Analyze Your Play entry point
- NFL matchup selection
- natural-language play input
- visible interpretation of the play
- supporting and contradicting evidence
- signal strength
- data confidence
- confidence score
- biggest risk
- concise decision brief

## Deferred From the POC

- User accounts and saved analyses
- Full sportsbook integrations
- Automated bet placement
- Live odds comparison across sportsbooks
- Multi-sport support
- Historical backtesting dashboards
- Personalized recommendation models
- Real-time alerts
- Large editorial/news system
- Deep individual game pages beyond what is necessary for the demo

## Possible Later Enhancements

MATCHUP//AI can later expand into additional sports, more prop types, live market data, saved decision history, alerts when signals materially change, and historical testing of its scoring framework.

## Non-Goals

- MATCHUP//AI is not a sportsbook.
- It will not execute wagers.
- It will not attempt to cover every betting market in V1.
- It will not hide contradictory evidence to make a play appear stronger.
- It will not replace original sports journalism with AI-generated reporting.
- It will not use a generic chat-first interface as the primary experience.

## Open Questions

None required before technical specification.
