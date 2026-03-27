# Use-Case Buying Guides Design

## Goal

Strengthen the commercial-intent internal-link graph by adding context-aware buying-guide links from use-case detail pages to the most relevant editorial hub pages.

## Scope

This design is limited to use-case detail pages and the editorial hub matching logic needed to support them.

In scope:

- derive related editorial buying guides for a use-case page
- render a compact right-rail module on use-case pages
- explain why each guide is relevant to the current use case
- add automated coverage for matching and rendering

Out of scope:

- new editorial hub content creation
- broader compare-page ranking changes
- changes to outbound affiliate redirect logic
- full multi-surface graph refactors across every page type

## Problem

Use-case pages already have strong editorial structure:

- recommended tools
- fit and avoid signals
- implementation playbook
- KPI scorecard
- FAQ

What they do not have is a dedicated bridge into the strongest commercial-intent pages on the site. That leaves a gap in the buyer journey:

- users can discover tools by scenario
- but they are not explicitly guided toward best-of, alternatives, or comparison hubs for the next buying step

This weakens both UX and topical clustering for SEO.

## Recommended Approach

Add a deterministic helper that derives buying-guide links for a use-case page from a blend of:

1. overlap between the use-case recommended tools and hub recommendations
2. hub intent relevance to the use case
3. supporting mentions in comparison-question content where useful

Render the results in a right-rail module titled `Buying Guides for This Use Case`.

## Alternatives Considered

### Option 1: Match only by tool overlap

Pros:

- simplest implementation
- low ambiguity

Cons:

- misses strong-intent alternatives and versus pages
- can produce generic rankings when tool overlap is similar

### Option 2: Match by mixed signals with explicit scoring

Pros:

- balances relevance, intent, and simplicity
- surfaces stronger commercial pages without overfitting
- keeps ranking logic deterministic and explainable

Cons:

- modestly more implementation logic than overlap-only matching

### Option 3: Build a full graph model across use cases, tools, hubs, and compare pages

Pros:

- highest long-term ceiling
- could power broad navigation and recommendation systems

Cons:

- too large for this increment
- harder to validate
- greater regression risk

## Chosen Design

Adopt Option 2.

We will compute related buying guides for each use-case page using explicit scoring:

- shared recommended tools carry the highest weight
- hub paths and titles aligned to the use-case domain add relevance weight
- supporting comparison-question mentions may add a small boost

Each output item will include:

- hub title
- hub path
- a short reason sentence built from the overlap or intent match

The module will show at most three guides.

If no high-confidence guide exists, the module will fall back to lightweight navigation:

- `/compare`
- `/tools`

## Ranking Rules

The ranking logic should be deterministic and auditable:

- inspect all editorial hubs from the current config layer
- count how many recommended tools overlap with the current use-case tools
- detect whether the hub title or path aligns with the use-case domain
- optionally use supporting comparison-question matches when they reinforce relevance
- rank by score descending, then keep config order as a stable fallback

This keeps the behavior understandable and easy to extend later.

## Rendering Strategy

Render the module in the use-case right rail:

- after `Related use cases`
- before `FAQ`

This placement supports the buyer journey naturally:

- understand the scenario
- review tools
- continue into buying and comparison guides

Each guide should be shown as a compact linked card with one short reason line.

## Testing Strategy

Add coverage in two layers:

- unit tests for the use-case buying-guide helper, including overlap scoring, intent weighting, deduplication, and maximum output count
- e2e coverage that asserts a representative use-case page renders the new module with at least one relevant guide and reason line

Use TDD for implementation:

- write failing tests first
- verify the expected failure
- implement the smallest helper and UI changes
- rerun focused tests

## Success Criteria

This work is complete when:

- use-case pages expose a `Buying Guides for This Use Case` module
- the links are based on real relevance rather than a static list
- at least one representative use-case page shows guide links and reason copy in e2e coverage
- matching rules are covered by unit tests
- the module strengthens buyer-path continuity without cluttering the right rail
