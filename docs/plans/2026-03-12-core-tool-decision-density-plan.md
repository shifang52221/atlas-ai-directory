# Core Tool Decision Density Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strengthen the six core tool profiles with denser decision-support content so launch users can evaluate fit, trade-offs, ownership, and rollout constraints more confidently.

**Architecture:** The implementation stays inside the existing fallback tool profile seeds in `lib/tool-profile-data.ts`. No component or schema changes are required; the work is a focused content-density pass backed by unit assertions and existing tool-detail e2e coverage.

**Tech Stack:** Next.js 16, TypeScript, Vitest, Playwright

---

### Task 1: Guard Decision Density for Core Tool Profiles

**Files:**
- Modify: `tests/unit/tool-profile-data.test.ts`

**Step 1: Write the failing test**

Add assertions for the six core tool profiles so each one has:

- at least 4 highlights
- at least 4 comparison notes
- comparison notes with meaningful length rather than shorthand fragments

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/tool-profile-data.test.ts`

Expected: FAIL because the current seed data only has three highlights and three comparison notes per core tool.

**Step 3: Write minimal implementation**

Update only the core-profile assertions needed for launch content density.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/tool-profile-data.test.ts`

Expected: PASS

### Task 2: Strengthen the Six Core Tool Seeds

**Files:**
- Modify: `lib/tool-profile-data.ts`
- Test: `tests/unit/tool-profile-data.test.ts`

**Step 1: Expand profile decision content**

For each of these slugs:

- `zapier-ai`
- `make`
- `n8n`
- `clay`
- `relevance-ai`
- `lindy`

Add one more concrete `highlight` and one more concrete `comparisonNote`, and tighten existing items so they speak to:

- team fit
- ownership
- rollout complexity
- pricing pressure
- governance or operational trade-offs

**Step 2: Run the unit test**

Run: `npm test -- tests/unit/tool-profile-data.test.ts`

Expected: PASS

### Task 3: Verify the Stronger Content on Public Tool Pages

**Files:**
- Reference: `app/tools/[slug]/page.tsx`
- Test: `tests/e2e/tool-detail.spec.ts`

**Step 1: Run focused tool-detail coverage**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS, with the updated content still rendering correctly in the current layout.

**Step 2: Fix only content-caused regressions if needed**

If any e2e assertion fails because the richer content broke rendering or text assumptions, patch only the content or test expectation needed to preserve the current product scope.

**Step 3: Re-run the same e2e test**

Expected: PASS
