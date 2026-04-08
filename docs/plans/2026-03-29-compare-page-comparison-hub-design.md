# Compare Page Comparison Hub Design

## Goal

Upgrade the `/compare` page from a lightweight methodology page into a high-intent comparison hub that connects tools, use cases, and editorial buying guides through strong internal links.

## Scope

This design is limited to the compare page and the helper logic required to assemble its comparison-focused sections.

In scope:

- restructure `/compare` into a richer comparison-intent hub
- derive popular tool-vs-tool links from existing content relationships
- derive use-case comparison clusters from existing use-case content
- derive buying-guide shortcuts from existing editorial hub content
- add tests for compare-page data assembly and rendering

Out of scope:

- a dynamic user-configurable comparison engine
- database schema changes
- arbitrary free-form compare matrix generation
- new editorial pages created solely for compare
- changes to outbound affiliate redirect logic

## Problem

The current `/compare` page is structurally correct but strategically underpowered:

- it contains metadata and methodology
- it links out to a few related pages
- it does not act as a true entry point for comparison-intent traffic

This leaves a valuable URL underutilized. Users searching with strong comparison intent need a page that helps them move quickly into:

- tool-vs-tool paths
- use-case-specific shortlists
- commercial buying guides

Without that, the internal-link graph remains thinner than it should be for SEO and monetization.

## Recommended Approach

Turn `/compare` into a comparison hub with four sections:

1. `Popular Head-to-Head Comparisons`
2. `Compare by Use Case`
3. `Best Buying Guides Before You Compare`
4. `How We Evaluate`

All links should be generated from existing content relationships so the page remains grounded in real assets rather than placeholder compare ideas.

## Alternatives Considered

### Option 1: Keep `/compare` mostly static and improve copy only

Pros:

- smallest implementation effort
- low regression risk

Cons:

- weak SEO gain
- still underuses a strong intent URL
- limited buyer-path value

### Option 2: Build a structured comparison-intent hub from existing content

Pros:

- strengthens internal links without requiring a full compare engine
- supports SEO, UX, and commercial discovery at once
- uses existing editorial assets, reducing content debt

Cons:

- needs helper logic and test coverage
- requires a custom page layout instead of a generic subpage shell

### Option 3: Build a full interactive compare engine now

Pros:

- highest long-term utility
- could become a major product feature

Cons:

- much larger scope
- more data and UI complexity
- not necessary for the current SEO/internal-linking objective

## Chosen Design

Adopt Option 2.

We will use existing content relationships to assemble compare-page sections:

- tool-detail alternative relationships for head-to-head comparisons
- use-case tool clusters for scenario-led comparisons
- editorial hub pages for shortlist and buying-guide shortcuts

The page should remain editorial and navigational, not become a fake matrix or overly interactive comparison builder.

## Content Model and Ranking Rules

### Popular Head-to-Head Comparisons

Source signals:

- tool-detail `alternativeSlugs`
- editorial hub `comparisonQuestions`
- existing alternatives and vs pages already in the site

Ranking:

- existing strong comparison-intent pages first (`alternatives`, `vs`)
- then pairs supported by multiple tool or hub relationships
- deduplicate mirrored pairs

### Compare by Use Case

Source signals:

- use-case page tool clusters
- use-case names and summaries

Output examples:

- Compare tools for Support Automation
- Compare tools for AI Sales
- Compare tools for Internal Ops

Ranking:

- prioritize use cases with stronger commercial or operational buying intent
- use stable configured order as a tiebreaker

### Best Buying Guides Before You Compare

Source signals:

- editorial hub configs
- best-of, alternatives, budget, and vs pages

Ranking:

- strongest commercial-intent pages first
- include a balanced mix of best-of and comparison-supporting guide types

## Rendering Strategy

The compare page should become a custom page rather than relying on the current generic shell.

Recommended order:

1. hero and quick explanation
2. popular head-to-head comparisons
3. compare by use case
4. best buying guides before you compare
5. methodology section

Each section should use compact linked cards with one short supporting sentence where useful.

## Testing Strategy

Add coverage in two layers:

- unit tests for compare-page data assembly and ranking
- e2e tests for rendered sections and representative links

The implementation should follow TDD:

- write failing tests first
- verify failure for the expected missing behavior
- implement the smallest compare-page data helper and page upgrade
- rerun focused tests

## Success Criteria

This work is complete when:

- `/compare` exposes tool-vs-tool links, use-case comparison clusters, and buying-guide shortcuts
- all major compare-page links come from real existing site relationships
- methodology remains present but is no longer the dominant section
- unit and e2e coverage validate the new compare-page sections
- the compare page becomes a stronger SEO and commercial bridge across the site
