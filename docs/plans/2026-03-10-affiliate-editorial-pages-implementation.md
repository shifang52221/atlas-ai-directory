# Affiliate Disclosure + Editorial Policy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add trust/compliance policy pages and wire them into navigation and affiliate-context UI.

**Architecture:** Build two static App Router pages with strong long-form sections, shared visual treatment via a page-local CSS module, and explicit internal links from footer/tool detail surfaces. Extend route smoke tests to include both new pages.

**Tech Stack:** Next.js App Router, TypeScript, CSS Modules, Playwright route tests.

---

### Task 1: Add policy routes with structured content

**Files:**
- Create: `f:/www/www12/app/affiliate-disclosure/page.tsx`
- Create: `f:/www/www12/app/editorial-policy/page.tsx`
- Create: `f:/www/www12/app/policy-pages.module.css`

**Step 1: Write route smoke expectations (failing first)**

- Add policy routes to `tests/e2e/routes.spec.ts`.

**Step 2: Run targeted test to verify failure**

Run: `npm run test:e2e -- tests/e2e/routes.spec.ts`
Expected: FAIL because new routes do not exist yet.

**Step 3: Implement pages**

- Add both routes with:
  - `export const metadata` (title/description),
  - top navigation and footer,
  - sectioned content (`h1`, multiple `h2` blocks, bullets).

**Step 4: Run targeted route test**

Run: `npm run test:e2e -- tests/e2e/routes.spec.ts`
Expected: PASS.

---

### Task 2: Wire policy links into existing UX

**Files:**
- Modify: `f:/www/www12/components/site-footer.tsx`
- Modify: `f:/www/www12/app/tools/[slug]/page.tsx`
- Modify: `f:/www/www12/app/tools/[slug]/page.module.css`

**Step 1: Footer links**

- Replace placeholder editorial link target.
- Add affiliate disclosure link to utility links.

**Step 2: Tool detail links**

- Add inline links to both policy pages near disclosure text.
- Style links to match current disclosure typography.

**Step 3: Validate visual integrity**

- Run lint/build and open route tests.

---

### Task 3: Full verification

**Step 1: Lint**

Run: `npm run lint`
Expected: PASS.

**Step 2: Unit tests**

Run: `npm test`
Expected: PASS.

**Step 3: Build**

Run: `npm run build`
Expected: PASS.

**Step 4: Targeted e2e**

Run: `npm run test:e2e -- tests/e2e/routes.spec.ts`
Expected: PASS.

