# Tool Hub Reverse Links Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static tool-page buying-guide list with context-aware reverse links from each tool detail page to the most relevant editorial buying guides.

**Architecture:** Add a small helper in the editorial hub data layer that derives related hub links for a tool from real hub recommendations and comparison questions. Then wire that helper into the tool detail page, render a concise `Featured in Buying Guides` module, and verify behavior with focused unit and e2e tests.

**Tech Stack:** TypeScript, Next.js 16, Vitest, Playwright, CSS Modules

---

### Task 1: Document the reverse-link matching behavior in tests

**Files:**
- Modify: `tests/unit/editorial-hubs.test.ts`
- Reference: `lib/editorial-hubs.ts`

**Step 1: Write the failing test**

Add focused unit coverage for a helper that derives related editorial hub links for a tool slug. Cover:

- a tool found in hub `recommendations`
- a tool mentioned in `comparisonQuestions`
- deduplication when both signals point to the same hub
- ordering that prefers recommendation matches
- a maximum of three returned links

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`

Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Add the smallest helper in `lib/editorial-hubs.ts` needed to satisfy the unit test.

**Step 4: Re-run the focused unit test**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`

Expected: PASS

### Task 2: Render a data-driven buying-guide module on tool pages

**Files:**
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `app/tools/[slug]/page.module.css`
- Reference: `lib/editorial-hubs.ts`

**Step 1: Write the failing test**

Add or extend tool-detail e2e coverage so a representative tool page shows:

- a `Featured in Buying Guides` heading
- at least one relevant hub link
- supporting reason copy for that link

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: FAIL because the new module and copy do not exist yet.

**Step 3: Write minimal implementation**

Update the tool detail page to:

- call the new helper with the current tool slug and name
- replace the static buying-guide list with the derived links
- render concise rationale text per hub
- keep the card compact and readable in the current layout

Add only the CSS needed for the new reason text and link layout.

**Step 4: Re-run the focused e2e test**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS

### Task 3: Verify ranking and fallback behavior stay stable

**Files:**
- Modify: `tests/unit/editorial-hubs.test.ts`
- Modify: `app/tools/[slug]/page.tsx`

**Step 1: Add fallback assertions if needed**

If the tool-detail page needs a fallback when no hubs match, add a focused unit or render-level assertion for that behavior.

**Step 2: Run the focused unit and e2e tests**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`
Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS

### Task 4: Run regression checks for the touched SEO and commercial paths

**Files:**
- Reference: `lib/editorial-hubs.ts`
- Reference: `app/tools/[slug]/page.tsx`
- Reference: `tests/unit/editorial-hubs.test.ts`
- Reference: `tests/e2e/tool-detail.spec.ts`

**Step 1: Run relevant unit tests**

Run: `npm test -- tests/unit/editorial-hubs.test.ts tests/unit/tool-detail-seo-content.test.ts`

Expected: PASS

**Step 2: Run focused e2e coverage**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS

**Step 3: Run lint and production build**

Run: `npm run lint`
Run: `npm run build`

Expected: PASS

**Step 4: Commit**

```bash
git add docs/plans/2026-03-27-tool-hub-reverse-links-design.md docs/plans/2026-03-27-tool-hub-reverse-links.md lib/editorial-hubs.ts app/tools/[slug]/page.tsx app/tools/[slug]/page.module.css tests/unit/editorial-hubs.test.ts tests/e2e/tool-detail.spec.ts
git commit -m "feat: add tool detail reverse links to editorial hubs"
```
