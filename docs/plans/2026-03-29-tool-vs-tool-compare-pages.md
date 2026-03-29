# Tool-vs-Tool Compare Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add curated canonical compare detail pages under `/compare/[pairSlug]` and route high-intent comparison traffic into them from the compare hub and tool detail pages.

**Architecture:** Add a dedicated compare-page registry that defines approved pairs, canonical slugs, editorial copy, FAQ items, and supporting internal links. Use that registry to generate static compare routes, resolve legacy compare query parameters, render a dedicated compare detail page, and extend sitemap and SEO tests so only curated compare pages are indexable.

**Tech Stack:** TypeScript, Next.js 16 App Router, Vitest, Playwright, CSS Modules

---

### Task 1: Define canonical compare pair behavior in unit tests

**Files:**
- Create: `tests/unit/tool-vs-pages.test.ts`
- Reference: `lib/tool-profile-data.ts`
- Reference: `lib/tool-detail-seo-content.ts`

**Step 1: Write the failing test**

Add focused tests for a new compare-page registry helper that:

- returns the six approved compare page slugs
- resolves canonical pair order for mirrored inputs
- returns `null` for unsupported pairs
- exposes enough content to render a compare page without placeholders

Cover at least:

- `zapier-ai` + `make` resolves to `zapier-ai-vs-make`
- `make` + `zapier-ai` resolves to the same canonical pair
- an unsupported pair such as `clay` + `lindy` returns `null`
- compare page seed content includes verdicts, comparison rows, and FAQ items

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/tool-vs-pages.test.ts`

Expected: FAIL because the compare-page registry does not exist yet.

**Step 3: Write minimal implementation**

Create a new registry helper file:

- `lib/tool-vs-pages.ts`

Implement the minimum API needed to satisfy the tests, including:

- canonical compare pair definitions
- approved compare slug list
- canonical pair lookup from two tool slugs
- compare page seed retrieval by `pairSlug`

**Step 4: Re-run the focused unit test**

Run: `npm test -- tests/unit/tool-vs-pages.test.ts`

Expected: PASS

### Task 2: Add the compare detail route with metadata and schema

**Files:**
- Create: `app/compare/[pairSlug]/page.tsx`
- Create: `app/compare/[pairSlug]/page.module.css`
- Modify: `lib/tool-vs-pages.ts`
- Modify: `tests/e2e/core-seo-jsonld.spec.ts`

**Step 1: Write the failing SEO/e2e assertions**

Add compare-detail coverage that requires:

- canonical metadata on `/compare/zapier-ai-vs-make`
- breadcrumb and FAQ schema on the compare detail page
- visible heading `Zapier AI vs Make`

Prefer adding a dedicated test block to:

- `tests/e2e/core-seo-jsonld.spec.ts`

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/core-seo-jsonld.spec.ts`

Expected: FAIL because the compare detail route does not exist yet.

**Step 3: Write minimal implementation**

Implement the compare detail route using the registry helper.

Required behaviors:

- static params for approved pair slugs only
- metadata generation from compare seed content
- compare detail JSON-LD
- hero, verdict, comparison table, recommendation, FAQ, and disclosure modules
- `notFound()` for unsupported pair slugs

**Step 4: Re-run the focused SEO/e2e test**

Run: `npm run test:e2e -- tests/e2e/core-seo-jsonld.spec.ts`

Expected: PASS

### Task 3: Route compare hub and tool detail links into canonical compare pages

**Files:**
- Modify: `lib/compare-page-data.ts`
- Modify: `lib/tool-vs-pages.ts`
- Modify: `app/compare/page.tsx`
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `tests/e2e/subpages-premium.spec.ts`

**Step 1: Write the failing e2e assertions**

Extend compare and tool-detail coverage to require:

- compare hub head-to-head cards link to `/compare/[pairSlug]`
- tool detail `Compare X vs Y` links point to canonical compare pages instead of query-param URLs

If needed, add a dedicated compare-detail navigation test in:

- `tests/e2e/subpages-premium.spec.ts`

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`

Expected: FAIL because existing compare links still point to generic compare flows.

**Step 3: Write minimal implementation**

Update link generation so:

- compare hub head-to-head items use canonical compare page hrefs
- tool detail compare links use canonical compare page hrefs when the pair is approved
- unsupported pairs can fall back to the existing compare anchor or compare hub

Keep the existing compare hub route intact.

**Step 4: Re-run the focused e2e test**

Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`

Expected: PASS

### Task 4: Add compare query fallback and sitemap coverage

**Files:**
- Modify: `app/compare/page.tsx`
- Modify: `app/sitemap.ts`
- Modify: `lib/tool-vs-pages.ts`
- Create or Modify: `tests/e2e/tool-vs-page.spec.ts`

**Step 1: Write the failing tests**

Add coverage for:

- `/compare?tool=zapier-ai&vs=make` resolving to `/compare/zapier-ai-vs-make`
- approved compare detail pages appearing in sitemap
- unsupported query pairs falling back to `/compare`

Prefer:

- a focused Playwright test for query behavior
- a unit or route assertion for sitemap compare entries

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/tool-vs-page.spec.ts`
Run: `npm test -- tests/unit/tool-vs-pages.test.ts`

Expected: FAIL because query fallback and sitemap coverage are not implemented yet.

**Step 3: Write minimal implementation**

Implement:

- compare query resolution in `/compare/page.tsx`
- compare page urls in `app/sitemap.ts`
- helper functions needed to keep canonical behavior stable

**Step 4: Re-run the focused tests**

Run: `npm run test:e2e -- tests/e2e/tool-vs-page.spec.ts`
Run: `npm test -- tests/unit/tool-vs-pages.test.ts`

Expected: PASS

### Task 5: Tighten copy quality and fallback behavior

**Files:**
- Modify: `lib/tool-vs-pages.ts`
- Modify: `app/compare/[pairSlug]/page.tsx`
- Modify: `tests/unit/tool-vs-pages.test.ts`
- Modify: `tests/e2e/tool-vs-page.spec.ts`

**Step 1: Add missing assertions**

Add content-quality assertions for:

- no placeholder phrasing in compare detail copy
- at least four FAQ items per compare page
- at least four detailed comparison sections
- clear `choose X if` and `choose Y if` recommendation blocks

**Step 2: Run focused verification**

Run: `npm test -- tests/unit/tool-vs-pages.test.ts`
Run: `npm run test:e2e -- tests/e2e/tool-vs-page.spec.ts`

Expected: PASS

### Task 6: Run full regression checks for compare detail pages

**Files:**
- Reference: `app/compare/page.tsx`
- Reference: `app/compare/[pairSlug]/page.tsx`
- Reference: `app/compare/[pairSlug]/page.module.css`
- Reference: `lib/tool-vs-pages.ts`
- Reference: `tests/unit/tool-vs-pages.test.ts`
- Reference: `tests/e2e/tool-vs-page.spec.ts`

**Step 1: Run the full unit suite**

Run: `npm test`

Expected: PASS

**Step 2: Run lint and production build**

Run: `npm run lint`
Run: `npm run build`

Expected: PASS

**Step 3: Run focused e2e and affiliate audit**

Run: `npm run test:e2e -- tests/e2e/core-seo-jsonld.spec.ts`
Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`
Run: `npm run test:e2e -- tests/e2e/tool-vs-page.spec.ts`
Run: `npm run audit:affiliate`

Expected: PASS

**Step 4: Commit**

```bash
git add docs/plans/2026-03-29-tool-vs-tool-compare-pages-design.md docs/plans/2026-03-29-tool-vs-tool-compare-pages.md app/compare/page.tsx app/compare/[pairSlug]/page.tsx app/compare/[pairSlug]/page.module.css app/sitemap.ts lib/tool-vs-pages.ts lib/compare-page-data.ts app/tools/[slug]/page.tsx tests/unit/tool-vs-pages.test.ts tests/e2e/core-seo-jsonld.spec.ts tests/e2e/subpages-premium.spec.ts tests/e2e/tool-vs-page.spec.ts
git commit -m "feat: add curated tool-vs-tool compare pages"
```
