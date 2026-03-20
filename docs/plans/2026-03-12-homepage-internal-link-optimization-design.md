# Homepage Internal Link Optimization Design

## Goal

Improve launch-readiness for the public site by making key directory, hub, and commercial pages easier to reach from the homepage and footer without expanding scope or changing the site's information architecture.

## Scope

This design focuses on the highest-leverage public navigation surfaces that already exist today:

- `app/homepage-client.tsx`
- `components/site-footer.tsx`
- `tests/e2e/homepage-navigation.spec.ts`
- `tests/e2e/homepage-interactions.spec.ts`

Secondary verification may also touch:

- `tests/e2e/homepage.spec.ts`

This design does not include:

- new routes
- database changes
- schema or metadata rewrites
- admin changes
- major visual redesign
- new recommendation logic

## Problem

The site already has solid route coverage and launch-grade core experiences, but the homepage still behaves more like a stylish directory landing page than a deliberate distribution layer for high-value pages.

Today, the main gaps are:

- some homepage link labels are broad rather than task-driven
- high-intent pages are present, but their priority is not always obvious
- the footer contains useful links, but its grouping can do more to communicate crawl and click priorities
- the launch plan still calls out internal links and crawl health as unfinished SEO work

This creates two avoidable launch risks:

- users may take extra clicks to reach money pages or key decision pages
- search engines may see weaker internal-link emphasis than the launch page set deserves

## Recommended Approach

Strengthen internal linking on the existing homepage and footer by clarifying link intent, tightening link grouping, and increasing the prominence of already-shipping high-value destinations.

The work should behave like a launch polish pass, not a redesign:

- keep the current page structure
- reuse existing sections
- make navigation labels more explicit
- highlight a smaller number of stronger destinations

## Alternatives Considered

### Option 1: Tight homepage and footer optimization only

Pros:

- lowest regression risk
- directly improves click depth and crawl depth
- fits the current launch window
- easy to guard with focused e2e tests

Cons:

- improvements are incremental rather than transformational

### Option 2: Add a new homepage commercial-link module

Pros:

- stronger commercial-page exposure
- clearer monetization funnel from the homepage

Cons:

- increases homepage complexity
- higher visual and behavioral regression surface
- more likely to introduce copy and layout churn before launch

### Option 3: Rework global information architecture

Pros:

- strongest long-term structural solution

Cons:

- too broad for the release window
- much larger test surface
- likely to distract from launch-critical polish

## Chosen Design

Adopt Option 1.

We will keep the current homepage and footer layout, but make them more intentional as a traffic-routing layer:

- clarify task-oriented homepage entry points to `/tools`, `/use-cases`, `/compare`, and `/workflows`
- preserve the existing buying-guide and featured-tool sections while making their next-click destinations more explicit
- tighten footer grouping so directory, trust, editorial hub, and commercial-intent links communicate clearer priority
- ensure representative hub and commercial pages remain directly reachable from strong global surfaces

## UX and Content Rules

Updated navigation should:

- use direct, action-oriented link language
- favor existing high-intent destinations over adding more choices
- avoid introducing visual clutter or a second competing nav system
- keep the current brand hierarchy intact
- preserve current homepage search, filter, and sort behavior

## Testing Strategy

Use focused e2e coverage to prove that the improved link structure exists without changing established homepage interactions.

Tests should verify:

- the homepage still renders core sections and search
- key directory links are visible from the homepage
- representative hub links remain visible
- representative commercial-intent links are visible from the footer or another stable homepage path
- search, filter, and sort behavior on the homepage remains unchanged

The tests should stay narrow and avoid expanding into unrelated SEO or layout assertions.

## Success Criteria

This work is complete when:

- the homepage exposes clearer task-based paths into the site's main money and discovery routes
- the footer reinforces crawlable access to key hub and commercial pages without feeling bloated
- no new pages or product scope are introduced
- homepage interaction behavior remains green
- focused e2e navigation coverage passes
