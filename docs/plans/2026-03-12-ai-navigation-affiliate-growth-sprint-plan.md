# AI Navigation Affiliate Growth Sprint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 14-day, revenue-first SEO sprint for the English AI navigation site, focused on high-intent commercial pages and affiliate conversion lift.

**Architecture:** Use the existing route architecture (`best-*` hubs, `/tools/[slug]`, `/use-cases/[slug]`) and extend it with a commercial page cluster model. Prioritize pages that map directly to active affiliate programs and buyer intent (`best`, `alternatives`, `vs`, `for <use case>`). Keep execution data-driven through click/placement tracking and weekly pruning.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma/PostgreSQL, Vitest, Playwright, existing outbound signature + affiliate analytics pipeline.

---

## Sprint Scope (2026-03-12 to 2026-03-25)

### P0 Affiliate Programs (Apply First)

1. Make
2. HubSpot
3. Semrush
4. monday.com
5. Synthesia
6. Descript

### First 12 Commercial Pages (Publish in Sprint)

1. Best AI automation tools for small business
2. Best AI sales agents for SMB teams
3. Best AI tools for marketing teams under $100/mo
4. Best AI tools for support ticket triage
5. Make alternatives
6. Semrush alternatives
7. HubSpot alternatives for startups
8. monday vs ClickUp for ops teams
9. Synthesia alternatives
10. Descript alternatives
11. AI sales automation tools for lead enrichment
12. AI workflow tools for internal operations

---

### Task 1: Create Affiliate Program Control Sheet

**Files:**
- Create: `docs/plans/2026-03-12-affiliate-program-control-sheet.md`
- Modify: `README.md` (add commercial operations section + link)

**Step 1: Write failing process check**

- Define required fields and mark sprint as blocked if any are missing:
  - Program URL
  - Application status
  - Payout model
  - Cookie window
  - Payment method
  - Last policy verification date

**Step 2: Validate baseline is incomplete (expected fail)**

Run: manual review against current repository docs.  
Expected: no centralized control sheet exists.

**Step 3: Implement minimal control sheet**

- Add a markdown table with one row per P0 program.
- Add columns for `owner`, `next action`, `deadline`, `notes`.

**Step 4: Validate control sheet completeness**

Run: manual checklist pass.  
Expected: 6/6 P0 programs have non-empty status and next action.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-12-affiliate-program-control-sheet.md README.md
git commit -m "docs: add affiliate program control sheet for p0 applications"
```

---

### Task 2: Define Commercial Intent Page Map (12-Page Matrix)

**Files:**
- Create: `docs/plans/2026-03-12-commercial-intent-page-map.md`
- Modify: `docs/plans/2026-03-11-launch-kpi-contract.md` (add page-level revenue KPI appendix)

**Step 1: Write failing coverage rule**

- Define hard rule: each new page must include:
  - Primary keyword intent
  - Primary affiliate program
  - Secondary alternatives
  - CTA placement IDs
  - Internal link targets

**Step 2: Verify current docs fail this rule**

Run: manual doc audit.  
Expected: no single 12-page map with full monetization metadata.

**Step 3: Implement page map**

- Build 12-row table with columns:
  - `page slug`
  - `intent type` (`best`, `alternatives`, `vs`, `use-case`)
  - `primary program`
  - `supporting programs`
  - `money CTA`
  - `required internal links`
  - `publish priority` (P0/P1)

**Step 4: Validate map**

Run: manual QA.  
Expected: each row has at least 1 primary + 2 supporting links.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-12-commercial-intent-page-map.md docs/plans/2026-03-11-launch-kpi-contract.md
git commit -m "docs: add 12-page commercial intent map with monetization metadata"
```

---

### Task 3: Add Content Data Source for New Commercial Pages

**Files:**
- Create: `lib/commercial-pages.ts`
- Modify: `lib/editorial-hubs.ts`
- Test: `tests/unit/editorial-hubs.test.ts`

**Step 1: Write failing unit tests**

- Add tests asserting:
  - New commercial page configs are present.
  - Each config has `title`, `metadataDescription`, `recommendations >= 3`.
  - Each config has at least 3 FAQ items.

**Step 2: Run targeted test to confirm fail**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`  
Expected: FAIL on missing new page configs.

**Step 3: Implement minimal data source**

- Create `lib/commercial-pages.ts` with typed config for 12 pages.
- Reuse ranking/recommendation structure from existing hub model.
- Import and merge into lookup functions used by route pages.

**Step 4: Run targeted tests**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/commercial-pages.ts lib/editorial-hubs.ts tests/unit/editorial-hubs.test.ts
git commit -m "feat: add commercial page config source for 12-page cluster"
```

---

### Task 4: Ship First 4 Commercial Pages (Wave 1)

**Files:**
- Create: `app/best-ai-automation-tools-for-small-business/page.tsx`
- Create: `app/make-alternatives/page.tsx`
- Create: `app/semrush-alternatives/page.tsx`
- Create: `app/monday-vs-clickup-for-ops/page.tsx`
- Modify: `components/site-footer.tsx`
- Test: `tests/e2e/editorial-hub.spec.ts`
- Test: `tests/e2e/core-seo-jsonld.spec.ts`

**Step 1: Write failing e2e assertions**

- Add checks:
  - Page loads with unique H1 and canonical.
  - JSON-LD contains `CollectionPage` or equivalent page schema.
  - Money CTA links are present and visible.

**Step 2: Run targeted e2e and confirm fail**

Run:  
`npm run test:e2e -- tests/e2e/editorial-hub.spec.ts tests/e2e/core-seo-jsonld.spec.ts`  
Expected: FAIL due to missing routes.

**Step 3: Implement pages**

- Use existing `EditorialHubPage` component for consistency.
- Add route-level metadata per page.
- Add footer internal links to expose new money pages.

**Step 4: Re-run targeted e2e**

Run:  
`npm run test:e2e -- tests/e2e/editorial-hub.spec.ts tests/e2e/core-seo-jsonld.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app/best-ai-automation-tools-for-small-business/page.tsx app/make-alternatives/page.tsx app/semrush-alternatives/page.tsx app/monday-vs-clickup-for-ops/page.tsx components/site-footer.tsx tests/e2e/editorial-hub.spec.ts tests/e2e/core-seo-jsonld.spec.ts
git commit -m "feat: launch wave-1 commercial pages and seo coverage"
```

---

### Task 5: Ship Next 4 Commercial Pages (Wave 2)

**Files:**
- Create: `app/hubspot-alternatives-for-startups/page.tsx`
- Create: `app/synthesia-alternatives/page.tsx`
- Create: `app/descript-alternatives/page.tsx`
- Create: `app/best-ai-tools-for-support-ticket-triage/page.tsx`
- Modify: `app/sitemap.ts`
- Test: `tests/e2e/technical-seo-routes.spec.ts`

**Step 1: Write failing SEO route tests**

- Ensure sitemap includes all Wave 2 pages.
- Ensure each page has canonical pointing to final URL.

**Step 2: Run targeted test and confirm fail**

Run: `npm run test:e2e -- tests/e2e/technical-seo-routes.spec.ts`  
Expected: FAIL before route additions.

**Step 3: Implement pages + sitemap inclusion**

- Add route files.
- Register pages in static sitemap path set.

**Step 4: Re-run targeted test**

Run: `npm run test:e2e -- tests/e2e/technical-seo-routes.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app/hubspot-alternatives-for-startups/page.tsx app/synthesia-alternatives/page.tsx app/descript-alternatives/page.tsx app/best-ai-tools-for-support-ticket-triage/page.tsx app/sitemap.ts tests/e2e/technical-seo-routes.spec.ts
git commit -m "feat: launch wave-2 commercial pages with sitemap coverage"
```

---

### Task 6: Ship Final 4 Commercial Pages (Wave 3)

**Files:**
- Create: `app/best-ai-sales-agents-for-smb/page.tsx`
- Create: `app/best-ai-tools-for-marketing-under-100/page.tsx`
- Create: `app/ai-sales-automation-tools-for-lead-enrichment/page.tsx`
- Create: `app/ai-workflow-tools-for-internal-operations/page.tsx`
- Modify: `components/editorial-hub-page.tsx` (optional reusable sections)
- Test: `tests/e2e/routes.spec.ts`

**Step 1: Write failing route smoke checks**

- Add route-level assertions for all Wave 3 slugs.

**Step 2: Run smoke e2e and confirm fail**

Run: `npm run test:e2e -- tests/e2e/routes.spec.ts`  
Expected: FAIL on missing routes.

**Step 3: Implement pages**

- Reuse component and content config patterns.
- Ensure each page has at least 3 outbound candidate links.

**Step 4: Re-run smoke test**

Run: `npm run test:e2e -- tests/e2e/routes.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app/best-ai-sales-agents-for-smb/page.tsx app/best-ai-tools-for-marketing-under-100/page.tsx app/ai-sales-automation-tools-for-lead-enrichment/page.tsx app/ai-workflow-tools-for-internal-operations/page.tsx components/editorial-hub-page.tsx tests/e2e/routes.spec.ts
git commit -m "feat: launch wave-3 commercial pages for 12-page cluster"
```

---

### Task 7: Enforce Conversion Instrumentation Contracts

**Files:**
- Modify: `components/editorial-hub-page.tsx`
- Modify: `lib/tool-profile-data.ts`
- Modify: `lib/affiliate-performance.ts`
- Test: `tests/unit/affiliate-performance.test.ts`

**Step 1: Write failing unit tests for placement consistency**

- Validate new placement IDs appear in attribution dimensions.
- Validate no missing `placementId` in outbound event metadata for commercial CTAs.

**Step 2: Run targeted unit tests**

Run: `npm test -- tests/unit/affiliate-performance.test.ts`  
Expected: FAIL before placement updates.

**Step 3: Implement placement taxonomy updates**

- Add explicit placement IDs for hero CTA, table CTA, alternative module CTA.
- Normalize naming across all 12 pages.

**Step 4: Re-run targeted unit tests**

Run: `npm test -- tests/unit/affiliate-performance.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add components/editorial-hub-page.tsx lib/tool-profile-data.ts lib/affiliate-performance.ts tests/unit/affiliate-performance.test.ts
git commit -m "feat: standardize placement instrumentation for commercial pages"
```

---

### Task 8: SEO + Quality Verification Gate

**Files:**
- Modify: `README.md` (add commercial sprint verification checklist)
- Create: `docs/plans/2026-03-12-commercial-sprint-verification-log.md`

**Step 1: Run full quality pack**

Run:
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run test:e2e`

Expected: all PASS (if e2e flaky, rerun failing spec and document root cause + rerun pass evidence).

**Step 2: Record output artifacts**

- Save command timestamps and result summary into verification log.
- Record e2e flaky tests separately with mitigation note.

**Step 3: Commit**

```bash
git add README.md docs/plans/2026-03-12-commercial-sprint-verification-log.md
git commit -m "docs: add commercial sprint verification evidence"
```

---

## KPI Targets for This Sprint

1. Index coverage for new 12 pages: >= 60% within 14 days of publish.
2. Hub/page outbound CTR median: >= 15%.
3. Click-to-conversion (where data available): >= 1.5%.
4. EPC (page-level): >= $1.00 on top 25% traffic pages.

## Non-Goals

1. No multilingual expansion.
2. No major UI redesign.
3. No new account/auth surface.

## Execution Sequence

1. Task 1-2 (ops + mapping docs)
2. Task 3 (content config base)
3. Task 4-6 (12-page launch in three waves)
4. Task 7 (tracking contract hardening)
5. Task 8 (verification and release gate)

