# Core Tool Decision Density Design

## Goal

Increase decision-making depth on the six launch-priority tool profiles so users can judge fit, trade-offs, rollout effort, and operational risk with less ambiguity.

## Scope

This design covers only the six core fallback tool profiles that drive the highest-value tool detail and commercial-hub experiences:

- `zapier-ai`
- `make`
- `n8n`
- `clay`
- `relevance-ai`
- `lindy`

Primary files in scope:

- `lib/tool-profile-data.ts`
- `tests/unit/tool-profile-data.test.ts`
- `tests/e2e/tool-detail.spec.ts`

This design does not include:

- new pages
- schema changes
- admin changes
- email changes
- new monetization logic

## Problem

The current tool profiles already render and convert, but the fallback profile data is still relatively light on decision support. The existing `highlights` and `comparisonNotes` are usable, but several entries are still too short, too generic, or too close to marketing copy.

For launch, the six core tools should answer these questions more clearly:

- What type of team is this actually good for?
- What trade-off shows up after the first pilot?
- Where does setup become heavier than expected?
- What cost, governance, or ownership constraint matters most?

## Recommended Approach

Strengthen the six core profile seeds in `lib/tool-profile-data.ts` by increasing the density and specificity of:

- `highlights`
- `comparisonNotes`

The page structure stays unchanged. We improve the content inputs that already feed:

- the tool detail page
- commercial hub recommendations
- SEO support content generation

## Alternatives Considered

### Option 1: Improve the profile seed content only

Pros:

- highest leverage for lowest change surface
- improves the actual content users read today
- no layout or schema risk

Cons:

- does not change the surrounding page structure

### Option 2: Improve profile seed content and tool-detail SEO override logic

Pros:

- deeper detail across multiple content sections

Cons:

- broader scope
- higher regression surface before launch

### Option 3: Improve CTA and conversion copy first

Pros:

- could improve clicks faster

Cons:

- weaker trust gain than stronger decision content
- more likely to feel over-optimized without deeper support content

## Chosen Design

Adopt Option 1.

We will strengthen the fallback seed content for the six core tools so that each profile has:

- four concrete highlights
- four concrete comparison notes
- more operator-facing detail around ownership, rollout, pricing pressure, and implementation fit

This keeps scope tight while materially improving user decision support.

## Content Rules

Updated content should:

- stay specific and operator-facing
- avoid hollow phrases like "good fit" without saying why
- include at least one ownership, setup, cost, or governance signal in comparison notes
- stay accurate without requiring fresh external verification
- remain compact enough for current UI without layout changes

## Testing Strategy

Add unit-level assertions that the six core profiles have stronger decision density:

- exactly the expected six profiles are checked
- each profile has at least four highlights
- each profile has at least four comparison notes
- the notes are specific enough to be launch-grade rather than placeholder shorthand

Then re-run tool-detail e2e coverage to confirm profile pages still render correctly.

## Success Criteria

This work is complete when:

- all six core tool profiles have richer, more decision-useful highlights and comparison notes
- unit tests enforce that density
- tool detail e2e coverage remains green
- no layout or product-scope changes are introduced
