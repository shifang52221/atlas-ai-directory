# Editorial Quality Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a DB-backed editorial quality gate for tool pages so indexing and monetization require explicit review and quality approval instead of basic field completeness alone.

**Architecture:** Extend the `Tool` model with explicit review, indexing, and evidence state, then thread that state through admin editing, publish validation, tool metadata, sitemap inclusion, and monetization policy. Keep the first slice limited to tool pages so we establish a durable quality-control pattern before expanding it to compare, use-case, and editorial hub content.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Vitest, Playwright

---

### Task 1: Add failing tests for tool quality-gate policy

**Files:**
- Create: `tests/unit/tool-quality-policy.test.ts`
- Modify: `tests/e2e/tool-detail.spec.ts`
- Modify: `tests/e2e/core-seo-jsonld.spec.ts`

**Step 1: Write the failing unit tests**

Add unit tests for a new quality-policy helper that requires:

- tools with `reviewStatus: APPROVED`, `indexingStatus: INDEX`, `qualityScore >= 70`, `evidenceStatus !== MISSING`, and filled editorial fields to be indexable
- tools missing those requirements to be `noindex`
- monetization approval to require both editorial approval and existing content sufficiency

**Step 2: Write the failing e2e assertions**

Add focused tool-detail coverage that requires:

- a DB-backed tool marked `NOINDEX` to emit a `robots` noindex signal
- indexable tool pages to remain unaffected

**Step 3: Run tests to verify they fail**

Run:

- `npm test -- tests/unit/tool-quality-policy.test.ts`
- `npm run test:e2e -- tests/e2e/tool-detail.spec.ts tests/e2e/core-seo-jsonld.spec.ts`

Expected: FAIL because the quality-policy helper and noindex metadata do not exist yet.

**Step 4: Commit**

Do not commit yet. Continue after green.

### Task 2: Add schema support for editorial quality state

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `lib/action-schemas.ts`
- Create: `lib/tool-quality-policy.ts`

**Step 1: Add schema fields**

Add:

- `ToolReviewStatus`
- `ToolIndexingStatus`
- `ToolEvidenceStatus`

And extend `Tool` with:

- `reviewStatus`
- `indexingStatus`
- `qualityScore`
- `evidenceStatus`
- `authorId`
- `reviewedById`
- `lastReviewedAt`
- `changeSummary`

**Step 2: Add form-schema parsing support**

Extend admin tool form schemas with the new fields and safe defaults.

**Step 3: Implement minimal quality policy helper**

Create `lib/tool-quality-policy.ts` with the minimum API needed by tests, including:

- `isToolIndexable(...)`
- `isToolEditoriallyApproved(...)`
- `isToolMonetizationEligible(...)`
- `getToolQualityBlockers(...)`

**Step 4: Run the unit test to verify it passes**

Run: `npm test -- tests/unit/tool-quality-policy.test.ts`

Expected: PASS

### Task 3: Thread quality-gate state through admin create, edit, and publish flow

**Files:**
- Modify: `app/admin/(protected)/tools/page.tsx`
- Modify: `app/admin/(protected)/tools/[slug]/page.tsx`
- Modify: `app/admin/(protected)/tools/actions.ts`

**Step 1: Write the failing admin action tests**

Add focused tests that require:

- new tools default to safe quality values
- tool update actions persist the new quality fields
- publish action reports editorial blockers when indexing requirements are not met

Prefer:

- `tests/unit/admin-tool-quality-gate.test.ts`

**Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/admin-tool-quality-gate.test.ts`

Expected: FAIL because admin forms and actions do not understand the new quality fields.

**Step 3: Implement minimal admin support**

Update the tool create and edit forms to expose:

- review status
- indexing status
- evidence status
- quality score
- author id
- reviewed by id
- last reviewed date
- change summary

Update actions so:

- creates get conservative defaults
- updates persist these fields
- publish returns separate blocker lists for base publish checks and index-quality checks

**Step 4: Re-run the unit test**

Run: `npm test -- tests/unit/admin-tool-quality-gate.test.ts`

Expected: PASS

### Task 4: Enforce noindex and sitemap gating for DB-backed tool pages

**Files:**
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `app/sitemap.ts`
- Modify: `tests/e2e/tool-detail.spec.ts`
- Modify: `tests/e2e/core-seo-jsonld.spec.ts`

**Step 1: Implement noindex metadata**

Update tool metadata generation so DB-backed tools that fail the indexing gate emit:

- `robots.index = false`
- `robots.follow = true`

Fallback launch profiles remain indexable.

**Step 2: Restrict sitemap inclusion**

Only include DB-backed tools in sitemap when:

- `status === ACTIVE`
- `indexingStatus === INDEX`

Fallback launch tools continue to appear when DB data is unavailable.

**Step 3: Re-run focused e2e coverage**

Run:

- `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`
- `npm run test:e2e -- tests/e2e/core-seo-jsonld.spec.ts`

Expected: PASS

### Task 5: Gate monetization with editorial approval

**Files:**
- Modify: `lib/adsense-policy.ts`
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `tests/unit/adsense-policy.test.ts`
- Modify: `tests/unit/tool-quality-policy.test.ts`

**Step 1: Write the failing monetization test**

Add assertions that tool monetization requires:

- current content-depth threshold
- editorial approval state

**Step 2: Run the test to verify it fails**

Run:

- `npm test -- tests/unit/adsense-policy.test.ts`
- `npm test -- tests/unit/tool-quality-policy.test.ts`

Expected: FAIL because monetization currently only checks content sufficiency.

**Step 3: Implement minimal monetization gate**

Thread the new policy helper into tool-page monetization logic so ads and commercial blocks only unlock when editorial state also qualifies.

**Step 4: Re-run the tests**

Run:

- `npm test -- tests/unit/adsense-policy.test.ts`
- `npm test -- tests/unit/tool-quality-policy.test.ts`

Expected: PASS

### Task 6: Run full verification and commit

**Files:**
- Reference: all touched files above

**Step 1: Run unit tests**

Run: `npm test`

Expected: PASS

**Step 2: Run lint and build**

Run:

- `npm run lint`
- `npm run build`

Expected: PASS

**Step 3: Run focused e2e**

Run:

- `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`
- `npm run test:e2e -- tests/e2e/core-seo-jsonld.spec.ts`

Expected: PASS

**Step 4: Commit**

```bash
git add prisma/schema.prisma lib/action-schemas.ts lib/tool-quality-policy.ts lib/adsense-policy.ts app/admin/(protected)/tools/page.tsx app/admin/(protected)/tools/[slug]/page.tsx app/admin/(protected)/tools/actions.ts app/tools/[slug]/page.tsx app/sitemap.ts tests/unit/tool-quality-policy.test.ts tests/unit/admin-tool-quality-gate.test.ts tests/unit/adsense-policy.test.ts tests/e2e/tool-detail.spec.ts tests/e2e/core-seo-jsonld.spec.ts docs/plans/2026-03-30-editorial-quality-gate-design.md docs/plans/2026-03-30-editorial-quality-gate.md
git commit -m "feat: add editorial quality gate for tool pages"
```
