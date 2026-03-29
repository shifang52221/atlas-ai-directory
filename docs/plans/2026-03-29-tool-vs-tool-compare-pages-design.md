# Tool-vs-Tool Compare Pages Design

## Goal

Add curated, indexable `tool vs tool` pages that turn comparison intent into strong SEO assets and high-conviction buyer journeys.

## Scope

This design covers dedicated compare detail pages under `/compare/[pairSlug]`, the curated data model that powers them, and the internal-link updates required to route users into those pages.

In scope:

- create canonical compare detail routes such as `/compare/zapier-ai-vs-make`
- add a curated compare-page seed model for approved tool pairs only
- render an editorial compare page with verdicts, decision blocks, and commercial CTAs
- update internal links so compare hub and tool detail pages point to canonical compare detail pages
- add sitemap, metadata, schema, unit, and e2e coverage for compare detail pages
- handle existing `/compare?tool=...&vs=...` entry points by resolving them to canonical compare routes when a curated pair exists

Out of scope:

- arbitrary user-generated compare combinations
- a generic matrix builder or interactive comparison engine
- database schema changes
- admin CMS for compare-page editing
- bulk generation of every possible pair from the tool catalog

## Problem

The site now has a stronger compare hub, but the highest-intent `tool vs tool` journeys still stop short of a dedicated landing page:

- compare hub cards currently point into generic tool compare anchors
- tool detail pages still route users through query-style compare links
- no canonical compare detail page exists for search terms such as `zapier ai vs make`
- this leaves valuable decision-stage traffic without a purpose-built page that can rank, convert, and link deeper into the site

That gap limits three things at once:

- SEO coverage for buyer-intent comparison terms
- affiliate conversion on users already close to a decision
- clarity of the internal-link graph between tools, compare hub, use cases, and buying guides

## Recommended Approach

Build a curated compare-page library with dedicated routes under `/compare/[pairSlug]`.

Each page should:

- target one approved tool pair only
- have one canonical slug and one canonical order
- present a clear editorial verdict, not a neutral feature dump
- connect users to both tool profiles, relevant use cases, and surrounding buying guides

The compare system should be content-led and highly selective, not open-ended.

## Alternatives Considered

### Option 1: Keep query parameter compare flows only

Pros:

- smallest implementation effort
- reuses existing compare entry links

Cons:

- weak SEO value
- poor canonical control
- content stays too generic for high-intent search traffic

### Option 2: Build curated canonical compare detail pages

Pros:

- strongest SEO fit for `tool vs tool` terms
- best match for buyer-intent content and affiliate conversion
- clean internal-link destination from hub pages and tool detail pages

Cons:

- needs a new route, data registry, and new tests
- compare copy must be curated rather than fully auto-generated

### Option 3: Build a generic compare engine that accepts any tool pair

Pros:

- broadest theoretical coverage
- could support future interactive compare UX

Cons:

- high thin-content risk
- much larger scope
- poor fit for the current editorial-content-first strategy

## Chosen Design

Adopt Option 2.

We will create a curated compare-page registry and only generate pages for approved, high-intent pairs.

The compare pages should be:

- editorial
- canonical
- selective
- commercially useful

They should not pretend to support every possible pair, and they should not be generated from a loose template with minimal differentiation.

## Route Strategy

### Primary Route

Use:

- `/compare/[pairSlug]`

Where `pairSlug` is a stable canonical slug such as:

- `zapier-ai-vs-make`
- `make-vs-n8n`
- `relevance-ai-vs-lindy`

### Canonical Rule

Each pair has exactly one canonical slug.

Examples:

- canonical: `/compare/zapier-ai-vs-make`
- non-canonical mirror path is not generated

This prevents duplicate pages and keeps sitemap and internal links stable.

### Existing Query Flow

The existing `/compare?tool=...&vs=...` entry path should no longer be the main destination.

Recommended behavior:

- if the query pair maps to an approved canonical compare page, redirect to `/compare/[pairSlug]`
- if no approved compare page exists, render the compare hub at `/compare`

This preserves current entry points from old links without creating low-quality fallback pages.

## Content Model

Add a dedicated compare-page registry, for example:

- `lib/tool-vs-pages.ts`

Each compare page seed should define:

- canonical pair slug
- tool A slug
- tool B slug
- SEO title intent
- SEO description intent
- hero verdict
- quick verdict bullets
- comparison table rows
- `choose A if` bullets
- `choose B if` bullets
- detailed editorial sections
- FAQ items
- supporting internal links

The page registry should merge with existing site data from:

- tool profiles
- tool detail SEO content
- use-case data
- editorial hub data

But the high-intent verdicts and compare copy should come from curated compare seeds, not raw auto-composition.

## Initial Compare Library

The first launch batch should include these six compare pages:

1. `zapier-ai-vs-make`
2. `zapier-ai-vs-n8n`
3. `make-vs-n8n`
4. `make-vs-clay`
5. `relevance-ai-vs-lindy`
6. `relevance-ai-vs-clay`

These pairs are already supported by strong comparison signals in the site and cover the most commercially useful decision paths.

## Rendering Strategy

Each compare page should follow a stable editorial structure:

1. hero with headline, summary, and dual CTAs
2. quick verdict block
3. comparison table for the most decision-relevant attributes
4. `Who should choose X` versus `Who should choose Y`
5. 4 to 6 detailed comparison sections
6. final recommendation
7. FAQ
8. internal-link modules
9. methodology and disclosure block

This page should feel like a decision page, not a lightweight directory view.

## SEO and Structured Data Strategy

Every compare detail page should have:

- unique metadata title
- unique metadata description
- canonical tag pointing to the canonical pair slug
- breadcrumb schema
- FAQ schema
- compare-page collection or article-style structured data

Only approved compare detail pages should be added to sitemap output.

No fallback or unapproved compare combinations should enter sitemap.

## Internal-Link Strategy

Update the site so the new compare pages become the main destination for pair-specific decision intent.

Required link sources:

- compare hub head-to-head cards
- tool detail `Compare X vs Y` links
- related buying-guide modules where compare pages are a natural next step

Required link destinations from compare pages:

- both tool detail pages
- relevant use-case pages
- nearby best-of or alternatives pages
- compare hub root page

## Error Handling Rules

- unapproved `pairSlug` returns `notFound()`
- mirrored or duplicate pair slugs are not generated
- unmatched query compare parameters fall back to `/compare`
- compare pages should never render partial content for an unknown pair

## Testing Strategy

Add coverage in three layers:

### Unit Tests

- canonical pair resolution
- pair registry integrity
- mirrored pair deduplication
- compare helper output completeness

### Route and SEO Tests

- metadata correctness
- canonical tag correctness
- schema presence
- sitemap inclusion for approved compare pages only

### E2E Tests

- compare detail page renders all major sections
- dual CTAs are visible
- internal links are present
- query fallback resolves correctly for approved pairs

The implementation should follow TDD.

## Success Criteria

This work is complete when:

- six curated compare detail pages exist under `/compare/[pairSlug]`
- compare hub and tool detail pages route users into canonical compare pages
- each compare page has differentiated editorial content and clear decision framing
- approved compare pages are in sitemap and have correct metadata and schema
- mirrored or unsupported compare combinations do not create indexable pages
- tests validate data integrity, page rendering, and canonical behavior
