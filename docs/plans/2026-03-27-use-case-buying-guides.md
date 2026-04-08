# Use-Case Buying Guides Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add context-aware buying-guide links to use-case detail pages so users can move from scenario discovery into higher-intent commercial editorial hubs.

**Architecture:** Extend the editorial hub data layer with a helper that scores hub relevance for a use-case based on recommended-tool overlap and intent alignment. Then render a compact `Buying Guides for This Use Case` module in the use-case right rail, and verify the behavior with focused unit and e2e tests.

**Tech Stack:** TypeScript, Next.js 16, Vitest, Playwright, CSS Modules

---

### Task 1: Define use-case buying-guide matching in unit tests

**Files:**
- Modify: `tests/unit/editorial-hubs.test.ts`
- Reference: `lib/editorial-hubs.ts`
- Reference: `lib/use-case-data.ts`

**Step 1: Write the failing test**

Add focused unit coverage for a helper that derives related buying guides for a use-case input. Cover:

- overlapping recommended tools between the use case and hubs
- intent-aware ranking for domain-relevant hubs
- a maximum of three returned results
- fallback behavior when there is no relevant match

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`

Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Add the smallest helper in `lib/editorial-hubs.ts` needed to satisfy the new test.

**Step 4: Re-run the focused unit test**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`

Expected: PASS

### Task 2: Render the buying-guide module on use-case pages

**Files:**
- Modify: `app/use-cases/[slug]/page.tsx`
- Modify: `app/use-cases/[slug]/page.module.css`
- Test: `tests/e2e/use-case-detail.spec.ts`

**Step 1: Write the failing test**

Extend the use-case detail e2e coverage so a representative page shows:

- a `Buying Guides for This Use Case` heading
- at least one relevant editorial-hub link
- a supporting reason line

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/use-case-detail.spec.ts`

Expected: FAIL because the new module does not exist yet.

**Step 3: Write minimal implementation**

Update the use-case page to:

- call the new helper using the use-case slug, name, and recommended tool slugs
- render the new module in the right rail after `Related use cases`
- render concise reason copy per hub
- show a lightweight fallback when no relevant guides are available

Add only the CSS needed to support the new right-rail card layout.

**Step 4: Re-run the focused e2e test**

Run: `npm run test:e2e -- tests/e2e/use-case-detail.spec.ts`

Expected: PASS

### Task 3: Verify helper behavior and fallback behavior stay stable

**Files:**
- Modify: `tests/unit/editorial-hubs.test.ts`
- Modify: `app/use-cases/[slug]/page.tsx`

**Step 1: Add any missing edge-case assertions**

If the helper or page rendering needs explicit fallback assertions, add them now.

**Step 2: Run the focused tests**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`
Run: `npm run test:e2e -- tests/e2e/use-case-detail.spec.ts`

Expected: PASS

### Task 4: Run regression checks across the touched commercial surfaces

**Files:**
- Reference: `lib/editorial-hubs.ts`
- Reference: `app/use-cases/[slug]/page.tsx`
- Reference: `tests/unit/editorial-hubs.test.ts`
- Reference: `tests/e2e/use-case-detail.spec.ts`

**Step 1: Run unit tests**

Run: `npm test`

Expected: PASS

**Step 2: Run lint and build**

Run: `npm run lint`
Run: `npm run build`

Expected: PASS

**Step 3: Run focused e2e and affiliate audit**

Run: `npm run test:e2e -- tests/e2e/use-case-detail.spec.ts`
Run: `npm run audit:affiliate`

Expected: PASS

**Step 4: Commit**

```bash
git add docs/plans/2026-03-27-use-case-buying-guides-design.md docs/plans/2026-03-27-use-case-buying-guides.md lib/editorial-hubs.ts app/use-cases/[slug]/page.tsx app/use-cases/[slug]/page.module.css tests/unit/editorial-hubs.test.ts tests/e2e/use-case-detail.spec.ts
git commit -m "feat: add use case buying guide links"
```
