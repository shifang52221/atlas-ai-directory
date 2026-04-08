# Tool Hub Reverse Links Design

## Goal

Strengthen the internal-link graph between tool detail pages and commercial editorial hubs by replacing the generic buying-guide list on tool pages with context-aware links to the most relevant best-of or comparison hubs.

## Scope

This design is limited to the tool detail experience and the editorial hub matching logic that powers it.

In scope:

- derive relevant editorial hub links for a tool based on real editorial relationships
- render a tool-detail module that explains why the tool appears in each linked hub
- add automated coverage for matching logic and tool-detail rendering

Out of scope:

- broader sitewide internal-link graph refactors
- changes to outbound affiliate tracking
- new hub content authoring beyond the link copy needed for this module
- changes to use-case pages or compare-page ranking logic

## Problem

Tool detail pages currently show a fixed "Best-of Buying Guides" list. That block has three weaknesses:

- it is generic rather than tool-specific
- it does not explain why the linked guides matter for the current tool
- it misses an opportunity to reinforce commercial-intent topical clusters for search and user navigation

This leaves tool pages with weaker semantic internal links than the editorial hubs already have.

## Recommended Approach

Build a deterministic helper that finds related editorial hubs for a tool using three clear signals:

1. the hub title or path is directly about the tool, especially for `alternatives` and `vs` pages
2. the tool appears in a hub's `recommendations`
3. the tool is mentioned in a hub's `comparisonQuestions`

Use title-targeted intent as the strongest signal, recommendation membership as the next signal, and comparison-question mentions as a supporting signal so the highest-confidence hubs appear first.

## Alternatives Considered

### Option 1: Keep the static tool-page hub list and only improve styling

Pros:

- minimal implementation effort
- no new matching logic

Cons:

- low editorial specificity
- limited SEO gain
- weaker buyer-path relevance

### Option 2: Add context-aware reverse links from tool pages to related hubs

Pros:

- creates semantically strong bidirectional links between tool and hub content
- improves UX by explaining why a guide is relevant
- increases commercial-intent depth without overcomplicating the page

Cons:

- requires small helper logic and tests
- depends on consistent editorial hub data

### Option 3: Build a full multi-surface internal-link graph now

Pros:

- highest long-term ceiling
- could connect tools, hubs, use cases, compare pages, and alternatives in one pass

Cons:

- too broad for this increment
- higher regression risk
- harder to validate in one review cycle

## Chosen Design

Adopt Option 2.

We will replace the generic tool-page buying-guide list with a more useful module named `Featured in Buying Guides`.

Each item in the module will include:

- the hub title
- a link to the hub
- a short reason line derived from the relationship between the tool and the hub

The initial reason system will stay simple and explicit:

- if the hub is directly about the tool through its title or path, explain that it is an alternatives or side-by-side decision guide
- if the tool is recommended in the hub, reuse the recommendation `bestFor` text
- if the tool is only present through comparison questions, use a short explanation that the tool is discussed in buyer comparison questions on that page

Results will be capped at three links to preserve focus and avoid link bloat.

## Data and Ranking Rules

The matching logic should be deterministic and easy to audit:

- iterate all editorial hubs returned by the current hub config layer
- check whether the hub title or path directly targets the tool for `alternatives` or `vs` intent pages
- for each hub, check whether the tool slug exists in `recommendations`
- also scan `comparisonQuestions` for the tool name or slug tokens
- assign title-targeted intent the highest score, recommendation matches the next score, and comparison-question-only matches the lowest score
- sort by match strength, then preserve hub-config order as a stable fallback

This avoids fuzzy heuristics while still producing relevant links for the current commercial pages.

## Rendering Strategy

On the tool detail page:

- replace the static `Best-of Buying Guides` card with the new data-driven card
- render at most three relevant hub links
- if no relevant hubs are found, fall back to a small generic CTA to browse `/compare` or `/use-cases`

The card should feel editorial rather than promotional, so the supporting copy should explain fit, not hype.

## Testing Strategy

Add coverage in two layers:

- unit tests for the hub-matching helper, including recommendation matches, comparison-question matches, ranking, and deduplication
- e2e test coverage confirming a representative tool detail page shows at least one relevant hub link and reason text

The implementation should follow TDD:

- add failing tests first
- verify the expected failure
- implement the minimal helper and UI changes
- rerun focused tests

## Success Criteria

This work is complete when:

- tool detail pages show hub links based on actual editorial relationships
- the generic hard-coded buying-guide list is removed from tool pages
- at least one representative tool page shows the new module in e2e coverage
- matching behavior is covered by unit tests
- the change improves internal-link relevance without adding noisy or excessive links
