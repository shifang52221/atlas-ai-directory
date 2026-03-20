# Front-of-Site Copy Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace placeholder-style fallback copy on public launch surfaces with intentional operator-facing language while preserving the current data flow and page structure.

**Architecture:** The implementation stays inside existing fallback data sources and page-fed content helpers. No schema changes or new UI components are needed; the work is a focused copy-quality pass backed by targeted unit and e2e assertions.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Playwright

---

### Task 1: Guard Homepage and Directory Fallback Copy

**Files:**
- Modify: `lib/homepage-data.ts`
- Modify: `lib/tools-directory-data.ts`
- Test: `tests/e2e/tools-directory.spec.ts`

**Step 1: Write the failing test**

Tighten the tools directory test so it requires concrete setup and pricing copy on the first fallback card and a clean results-count line.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/tools-directory.spec.ts`

Expected: FAIL if the page still uses weak fallback copy.

**Step 3: Write minimal implementation**

Update the homepage and tools directory fallback text so unknown descriptions and setup/pricing labels still sound launch-ready and specific.

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/tools-directory.spec.ts`

Expected: PASS

### Task 2: Guard Tool Profile Fallback Copy

**Files:**
- Modify: `lib/tool-profile-data.ts`
- Test: `tests/unit/tool-profile-data.test.ts`

**Step 1: Write the failing test**

Add assertions that fallback tool profiles and database-fallback profile text do not use placeholder phrases such as "being expanded" or "available shortly".

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/tool-profile-data.test.ts`

Expected: FAIL before implementation if placeholder copy remains.

**Step 3: Write minimal implementation**

Replace weak fallback phrases with concise operator-facing copy that still stays truthful when exact data is unavailable.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/tool-profile-data.test.ts`

Expected: PASS

### Task 3: Guard Use-Case Fallback Copy

**Files:**
- Modify: `lib/use-case-data.ts`
- Test: `tests/unit/use-case-data.test.ts`

**Step 1: Write the failing test**

Add assertions that fallback tool blurbs within use-case pages avoid placeholder-style phrases.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/use-case-data.test.ts`

Expected: FAIL before implementation if placeholder text remains.

**Step 3: Write minimal implementation**

Update use-case fallback blurbs so they stay practical and specific even when sourced from fallback data.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/use-case-data.test.ts`

Expected: PASS

### Task 4: Verify Public Launch Surfaces Still Render

**Files:**
- Reference: `app/page.tsx`
- Reference: `app/tools/page.tsx`
- Reference: `app/tools/[slug]/page.tsx`
- Reference: `app/use-cases/[slug]/page.tsx`
- Test: `tests/e2e/homepage.spec.ts`
- Test: `tests/e2e/core-seo-jsonld.spec.ts`
- Test: `tests/e2e/preview.spec.ts`
- Test: `tests/e2e/tools-directory.spec.ts`
- Test: `tests/e2e/tool-detail.spec.ts`
- Test: `tests/e2e/use-case-detail.spec.ts`

**Step 1: Run the focused verification pack**

Run:

```bash
npm run test:e2e -- tests/e2e/homepage.spec.ts tests/e2e/core-seo-jsonld.spec.ts tests/e2e/preview.spec.ts tests/e2e/tools-directory.spec.ts tests/e2e/tool-detail.spec.ts tests/e2e/use-case-detail.spec.ts
```

Expected: all selected public-surface tests PASS.

**Step 2: If failures appear, patch only the affected copy path**

Do not add new scope. Fix the minimum content/data source causing the failure.

**Step 3: Re-run the same pack**

Expected: PASS
