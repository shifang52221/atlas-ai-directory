# Compare Page Comparison Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `/compare` into a comparison-intent hub that routes users into head-to-head tool paths, use-case clusters, and commercial buying guides.

**Architecture:** Add a dedicated compare-page data helper that assembles ranked head-to-head pairs, use-case clusters, and buying-guide shortcuts from existing content relationships. Then replace the current generic compare shell with a custom page layout driven by that helper, and verify it with focused unit and e2e tests.

**Tech Stack:** TypeScript, Next.js 16, Vitest, Playwright, CSS Modules

---

### Task 1: Define compare-page data assembly in unit tests

**Files:**
- Create: `tests/unit/compare-page-data.test.ts`
- Reference: `lib/editorial-hubs.ts`
- Reference: `lib/use-case-data.ts`
- Reference: `lib/tool-detail-seo-content.ts`

**Step 1: Write the failing test**

Add focused unit tests for a compare-page helper that returns:

- popular head-to-head comparison pairs
- use-case comparison clusters
- buying-guide shortcut links

Cover:

- ranking and deduplication for tool pairs
- use-case cluster generation
- buying-guide output count and relevance

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/compare-page-data.test.ts`

Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Create the smallest helper needed to satisfy the test.

**Step 4: Re-run the focused unit test**

Run: `npm test -- tests/unit/compare-page-data.test.ts`

Expected: PASS

### Task 2: Replace the generic compare page with a custom comparison hub

**Files:**
- Create: `app/compare/page.module.css`
- Modify: `app/compare/page.tsx`
- Create or Modify: `lib/compare-page-data.ts`

**Step 1: Write the failing e2e assertions**

Add or extend compare-page e2e coverage to require:

- `Popular Head-to-Head Comparisons`
- `Compare by Use Case`
- `Best Buying Guides Before You Compare`
- at least one link in each section

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`

Expected: FAIL because the new compare hub sections do not exist yet.

**Step 3: Write minimal implementation**

Update `/compare` to use the helper output and render the four-section comparison hub.

Keep:

- metadata
- structured data
- methodology content

Replace:

- the generic shell layout

**Step 4: Re-run the focused e2e test**

Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`

Expected: PASS

### Task 3: Tighten compare-page copy and stable link behavior

**Files:**
- Modify: `app/compare/page.tsx`
- Modify: `tests/unit/compare-page-data.test.ts`
- Modify: `tests/e2e/subpages-premium.spec.ts`

**Step 1: Add missing assertions for copy or fallback behavior**

If the helper or page needs explicit fallback assertions, add them now.

**Step 2: Run focused unit and e2e verification**

Run: `npm test -- tests/unit/compare-page-data.test.ts`
Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`

Expected: PASS

### Task 4: Run full regression checks for the compare hub upgrade

**Files:**
- Reference: `app/compare/page.tsx`
- Reference: `app/compare/page.module.css`
- Reference: `lib/compare-page-data.ts`
- Reference: `tests/unit/compare-page-data.test.ts`

**Step 1: Run the full unit suite**

Run: `npm test`

Expected: PASS

**Step 2: Run lint and production build**

Run: `npm run lint`
Run: `npm run build`

Expected: PASS

**Step 3: Run focused e2e and affiliate audit**

Run: `npm run test:e2e -- tests/e2e/subpages-premium.spec.ts`
Run: `npm run audit:affiliate`

Expected: PASS

**Step 4: Commit**

```bash
git add docs/plans/2026-03-29-compare-page-comparison-hub-design.md docs/plans/2026-03-29-compare-page-comparison-hub.md app/compare/page.tsx app/compare/page.module.css lib/compare-page-data.ts tests/unit/compare-page-data.test.ts tests/e2e/subpages-premium.spec.ts
git commit -m "feat: turn compare page into comparison hub"
```
