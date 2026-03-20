# Homepage Commercial Link Surfacing Design

## Goal

Increase the visibility of launch-priority commercial pages from the homepage body so users can move from discovery into comparison and alternative-decision pages without relying on the footer alone.

## Scope

This design is limited to existing homepage modules and their public link behavior:

- `app/homepage-client.tsx`
- `tests/e2e/homepage-navigation.spec.ts`
- `tests/e2e/homepage-interactions.spec.ts`
- `tests/e2e/homepage.spec.ts`

Relevant existing surfaces include:

- `Featured tools`
- `Top this week`
- `Recently updated`
- `Best AI buying guides`

This design does not include:

- new routes
- new data sources
- database changes
- new homepage sections that materially expand layout depth
- changes to search, filter, or sort behavior
- footer restructuring beyond what has already been completed

## Problem

The homepage already exposes strong directory routes and footer-level commercial pages, but the body of the page still leans more heavily toward discovery than toward the next commercial decision step.

That leaves a gap between:

- seeing tools or guide categories
- entering high-intent pages such as alternatives, comparisons, and best-for pages

In practical terms, the homepage currently risks:

- over-relying on the footer for commercial page discovery
- asking users to infer the next step after reading tool cards or lists
- under-signaling which pages are meant to help shortlist or compare options

## Recommended Approach

Strengthen commercial intent surfacing inside the homepage's existing body modules rather than adding a new dedicated commercial block.

The approach should stay conservative:

- reuse existing modules
- sharpen section-level destination language
- expose a small number of representative commercial pages
- keep the homepage feeling like a directory, not a monetization-heavy landing page

## Alternatives Considered

### Option 1: Strengthen commercial links inside existing homepage modules

Pros:

- lowest regression risk
- preserves the current homepage composition
- improves decision flow without introducing visual clutter
- easy to guard with focused e2e coverage

Cons:

- gains are more subtle than adding a dedicated new module

### Option 2: Add a compact homepage commercial-links module

Pros:

- highest direct visibility for alternative and comparison pages
- very explicit monetization path

Cons:

- increases homepage density
- higher risk of the page feeling over-optimized
- broader copy and layout review surface before launch

### Option 3: Push commercial pages into the hero or top rail

Pros:

- maximum exposure

Cons:

- disrupts the homepage's discovery-first positioning
- too aggressive for the current release window

## Chosen Design

Adopt Option 1.

We will treat existing homepage modules as the commercial decision bridge:

- keep `Featured tools` focused on profile discovery, while making the nearby next step toward comparison clearer
- use `Top this week` and `Recently updated` as shortlist-building entry points rather than generic trend lists
- expose a small set of representative commercial pages from the homepage body, not only from the footer
- preserve `Best AI buying guides` as editorial entry points that naturally lead into deeper decision pages

## UX and Content Rules

Updated homepage commercial surfacing should:

- stay within existing modules
- use action-oriented, decision-oriented language
- prioritize 2 to 4 high-value commercial destinations rather than many links
- look like editorial decision support, not ad clutter
- maintain the current homepage brand hierarchy and visual rhythm

## Testing Strategy

Focused e2e coverage should prove that representative commercial pages are visible from the homepage body.

Tests should verify:

- at least one representative alternative page is exposed from the homepage body
- at least one representative comparison or best-for page is exposed from the homepage body
- existing hub links remain visible
- homepage search, filter, and sort behavior still works

The test scope should remain narrow and avoid turning this into a broader layout or SEO suite.

## Success Criteria

This work is complete when:

- representative commercial-intent pages are visible from the homepage body without scrolling to the footer
- the homepage still reads as a directory and decision hub rather than a commercial wall
- no new routes or data dependencies are introduced
- focused homepage e2e coverage passes
- existing homepage interaction coverage stays green
