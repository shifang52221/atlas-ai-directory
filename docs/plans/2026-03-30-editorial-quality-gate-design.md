# Editorial Quality Gate Design

## Goal

Add a first-class editorial quality gate so low-depth or insufficiently reviewed tool pages do not get indexed, monetized, or treated as publish-ready by default.

## Scope

This first phase covers only `Tool` detail pages and the existing tool publishing workflow.

Primary files and systems in scope:

- `prisma/schema.prisma`
- `app/admin/(protected)/tools/page.tsx`
- `app/admin/(protected)/tools/[slug]/page.tsx`
- `app/admin/(protected)/tools/actions.ts`
- `lib/action-schemas.ts`
- `lib/tool-profile-data.ts`
- `lib/adsense-policy.ts`
- `app/tools/[slug]/page.tsx`
- `app/sitemap.ts`
- related unit and e2e tests

This phase does not include:

- separate DB-backed quality models for compare, use-case, or editorial hub pages
- author profile pages
- reviewer profile pages
- a cross-site editorial dashboard
- full workflow orchestration for all content types

## Problem

The current admin publishing flow protects against obviously incomplete tool records, but it does not protect against pages that are structurally complete yet still too thin, too templated, or not editorially reviewed enough for indexing and monetization.

Today the system can validate:

- name
- website URL
- description presence
- category presence
- primary link presence

That is useful, but it is not enough for a site whose long-term SEO risk is "template-like affiliate pages with insufficient added value."

We need a stronger gate that answers:

- Is this page reviewed enough to be indexed?
- Is it strong enough to carry affiliate and ad placements?
- Can editors see and control that status in the admin?
- Can the public site enforce the same policy consistently?

## Alternatives Considered

### Option 1: Runtime-only quality rules

Keep all logic in rendering code and infer `noindex`, ad eligibility, and affiliate eligibility from existing fields like description length and FAQ count.

Pros:

- fastest to ship
- no schema migration
- low admin change surface

Cons:

- hidden rules, hard for editors to reason about
- weak auditability
- no explicit publish-state separation between "public" and "indexable"

### Option 2: DB-backed tool quality gate

Add explicit quality and editorial review fields to `Tool`, expose them in admin, and enforce them in publish/index/monetization logic.

Pros:

- clear, inspectable policy state
- supports future expansion
- aligns admin workflow and public rendering
- strongest fit for current product maturity

Cons:

- requires schema change
- requires admin and rendering updates

### Option 3: Separate page audit system for all content types

Create a dedicated quality audit model for tools, compare pages, use cases, and editorial hubs.

Pros:

- most scalable long term
- unifies policy across the entire site

Cons:

- too large for the current slice
- higher risk of overbuilding before we prove the first workflow

## Chosen Design

Adopt Option 2 for tools only.

We will add explicit editorial quality fields to `Tool`, then use them to control:

- publish readiness in admin
- indexability on tool detail pages
- inclusion in sitemap
- monetization eligibility

This gives us one authoritative source of truth while keeping the first slice narrow enough to ship safely.

## Data Model

Add the following enums and fields to `Tool`:

- `ToolReviewStatus`
  - `DRAFT`
  - `IN_REVIEW`
  - `APPROVED`
- `ToolIndexingStatus`
  - `NOINDEX`
  - `INDEX`
- `ToolEvidenceStatus`
  - `MISSING`
  - `PARTIAL`
  - `COMPLETE`

New tool fields:

- `reviewStatus`
- `indexingStatus`
- `qualityScore`
- `evidenceStatus`
- `authorId`
- `reviewedById`
- `lastReviewedAt`
- `changeSummary`

The key idea is to separate "record exists" from "record is good enough to index and monetize."

## Policy Rules

### Publish readiness

Publishing a tool should continue to require current basic checks, but indexing should require stronger editorial checks.

Base publish checks stay:

- valid name
- valid website URL
- non-empty description
- at least one category
- valid primary tracking link

Editorial quality checks for `INDEX`:

- `reviewStatus === APPROVED`
- `qualityScore >= minimum threshold`
- `evidenceStatus !== MISSING`
- `authorId` present
- `reviewedById` present
- `lastReviewedAt` present
- `changeSummary` present

### Public rendering

Tool pages remain accessible even when not indexable, but:

- `noindex` tools must emit `robots: noindex, follow`
- `noindex` tools must not enter sitemap
- `noindex` tools must not pass monetization gates

### Monetization

Current runtime safety checks in `lib/adsense-policy.ts` remain in place.

New rule:

- ads and affiliate commercialization require both
  - runtime content sufficiency
  - editorial quality approval state

This preserves today’s safety net while adding a stronger editorial layer.

## Admin UX

Tool admin should expose the new quality fields directly so editors can see why a page is blocked.

The tool detail screen should show:

- review status
- indexing status
- evidence status
- quality score
- author
- reviewer
- last reviewed date
- change summary

Publishing feedback should split into:

- base publish blockers
- index-quality blockers

That distinction matters because a tool may be public but still intentionally `NOINDEX`.

## Rendering and SEO Behavior

Tool metadata should be driven by the new policy state:

- `INDEX` tool: canonical metadata plus indexable robots behavior
- `NOINDEX` tool: canonical metadata plus `robots: { index: false, follow: true }`

Sitemap should include only tool pages whose DB record is active and `indexingStatus === INDEX`.

Fallback tool profiles should remain indexable for the current launch set because they are our editorially maintained seed content and do not depend on DB state.

## Testing Strategy

Add tests that prove:

- schema-backed tool quality state is enforced by admin actions
- tool pages emit `noindex` metadata when quality state blocks indexing
- sitemap excludes DB tools marked `NOINDEX`
- monetization gates require editorial approval in addition to content sufficiency

The first slice should prefer unit and focused e2e coverage rather than a large end-to-end workflow harness.

## Success Criteria

This phase is complete when:

- tool records can store explicit editorial quality state
- admin can edit and view those fields
- publish flow distinguishes public availability from indexing readiness
- tool detail pages can emit `noindex`
- sitemap excludes DB-backed tools not approved for indexing
- monetization requires both content sufficiency and editorial quality approval
- tests enforce the quality-gate contract
