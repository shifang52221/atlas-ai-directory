# Launch Readiness Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepare Atlas AI Directory for code freeze on March 25, 2026 and public launch on April 1, 2026 by tightening brand consistency, replacing weak fallback content on priority pages, validating monetization and analytics, and running a full release verification pack.

**Architecture:** The site is already structured as a Next.js App Router content platform with Prisma-backed tool/category data, fallback content seeds, protected admin routes, outbound redirect tracking, and commercial editorial hub pages. The launch push should avoid adding new product surface area and instead strengthen the highest-intent pages, make real data the default wherever possible, and prove the end-to-end path from SEO landing page to outbound click, submission review, and admin monitoring.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, Vitest, Playwright, ESLint

---

### Task 1: Lock Brand and Metadata Consistency

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/homepage-client.tsx`
- Modify: `app/tools/page.tsx`
- Modify: `app/use-cases/page.tsx`
- Modify: `app/compare/page.tsx`
- Modify: `app/workflows/page.tsx`
- Modify: `app/affiliate-disclosure/page.tsx`
- Modify: `app/editorial-policy/page.tsx`
- Test: `tests/e2e/homepage.spec.ts`
- Test: `tests/e2e/core-seo-jsonld.spec.ts`
- Test: `tests/e2e/policy-pages-seo.spec.ts`

**Step 1: Write or tighten the failing assertions**

Add or update assertions so the homepage, metadata, and structured data all use the same primary brand string and secondary descriptor. Validate title, visible header brand, and Organization/WebSite JSON-LD.

**Step 2: Run the targeted tests**

Run: `npm test -- tests/unit/tool-detail-seo-content.test.ts`

Run: `npm run test:e2e -- homepage.spec.ts core-seo-jsonld.spec.ts policy-pages-seo.spec.ts`

Expected: at least one assertion fails or reveals inconsistent branding before content changes.

**Step 3: Update the implementation**

Choose one primary naming pattern:
- Primary brand: `Atlas AI Directory`
- Secondary descriptor: `AI Agents Decision Hub`

Update layout metadata, homepage copy, and policy/supporting pages so visible UI and SEO metadata match.

**Step 4: Re-run the targeted tests**

Run: `npm run test:e2e -- homepage.spec.ts core-seo-jsonld.spec.ts policy-pages-seo.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx app/homepage-client.tsx app/tools/page.tsx app/use-cases/page.tsx app/compare/page.tsx app/workflows/page.tsx app/affiliate-disclosure/page.tsx app/editorial-policy/page.tsx tests/e2e/homepage.spec.ts tests/e2e/core-seo-jsonld.spec.ts tests/e2e/policy-pages-seo.spec.ts
git commit -m "chore: align launch branding and metadata"
```

### Task 2: Replace Weak Launch Content on Priority Tool and Use-Case Pages

**Files:**
- Modify: `lib/homepage-data.ts`
- Modify: `lib/tool-profile-data.ts`
- Modify: `lib/tools-directory-data.ts`
- Modify: `lib/use-case-data.ts`
- Modify: `lib/tool-detail-seo-content.ts`
- Test: `tests/unit/tool-profile-data.test.ts`
- Test: `tests/unit/tool-detail-seo-content.test.ts`
- Test: `tests/e2e/tool-detail.spec.ts`
- Test: `tests/e2e/use-case-detail.spec.ts`

**Step 1: Define the launch content scope**

Create a launch shortlist of:
- 10 priority tool profiles
- 6 priority use-case pages
- 4 primary editorial hubs already present in navigation

Use real descriptions, sharper fit/avoid language, current pricing/setup labels, and clearer internal links. If database content is incomplete, strengthen fallback content intentionally rather than leaving generic copy in place.

**Step 2: Write failing expectations for content depth**

Add or tighten tests so priority pages require:
- non-empty decision checklist sections
- FAQ content
- at least one relevant internal link
- non-placeholder pricing/setup labels on launch-priority profiles

**Step 3: Update the content sources**

Improve the selected profiles and use-case seeds in the `lib/*data.ts` sources. Keep scope tight; do not broaden to every possible tool before launch.

**Step 4: Re-run the targeted tests**

Run: `npm test -- tests/unit/tool-profile-data.test.ts tests/unit/tool-detail-seo-content.test.ts`

Run: `npm run test:e2e -- tool-detail.spec.ts use-case-detail.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/homepage-data.ts lib/tool-profile-data.ts lib/tools-directory-data.ts lib/use-case-data.ts lib/tool-detail-seo-content.ts tests/unit/tool-profile-data.test.ts tests/unit/tool-detail-seo-content.test.ts tests/e2e/tool-detail.spec.ts tests/e2e/use-case-detail.spec.ts
git commit -m "content: strengthen launch-priority tools and use cases"
```

### Task 3: Tighten Commercial Hub Pages Around Conversion and Differentiation

**Files:**
- Modify: `lib/editorial-hubs.ts`
- Modify: `lib/commercial-pages.ts`
- Modify: `components/editorial-hub-page.tsx`
- Modify: `components/hub-impression-tracker.tsx`
- Test: `tests/unit/editorial-hubs.test.ts`
- Test: `tests/e2e/editorial-hub.spec.ts`
- Test: `tests/e2e/homepage-premium-motion.spec.ts`

**Step 1: Write failing checks for launch hub quality**

Add or tighten tests to enforce:
- top picks render correctly
- disclosure copy is present
- comparison table CTA links exist
- FAQ and internal links render on every commercial hub
- impression tracking posts once per session

**Step 2: Run the targeted tests**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`

Run: `npm run test:e2e -- editorial-hub.spec.ts homepage-premium-motion.spec.ts`

Expected: FAIL or expose missing/weak hub behavior before edits.

**Step 3: Improve the highest-intent hubs only**

Prioritize:
- `/best-ai-automation-tools`
- `/best-ai-agents-for-sales`
- `/best-ai-tools-for-support`
- `/best-ai-tools-for-marketing`

Focus on clearer evidence text, stronger tradeoff language, tighter CTA copy, and better related-link flow to tool details and use cases.

**Step 4: Re-run the targeted tests**

Run: `npm test -- tests/unit/editorial-hubs.test.ts`

Run: `npm run test:e2e -- editorial-hub.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/editorial-hubs.ts lib/commercial-pages.ts components/editorial-hub-page.tsx components/hub-impression-tracker.tsx tests/unit/editorial-hubs.test.ts tests/e2e/editorial-hub.spec.ts tests/e2e/homepage-premium-motion.spec.ts
git commit -m "feat: improve launch-priority commercial hubs"
```

### Task 4: Validate Monetization, Outbound Safety, and Submission Operations

**Files:**
- Modify: `app/api/outbound/route.ts`
- Modify: `app/submit/actions.ts`
- Modify: `lib/monetization-config.ts`
- Modify: `.env.example`
- Modify: `README.md`
- Test: `tests/unit/outbound-signature.test.ts`
- Test: `tests/unit/request-ip.test.ts`
- Test: `tests/unit/rate-limit.test.ts`
- Test: `tests/unit/email-notifications.test.ts`
- Test: `tests/e2e/submit-page.spec.ts`
- Test: `tests/e2e/adsense-policy.spec.ts`

**Step 1: Write or review failure cases first**

Ensure tests cover:
- invalid outbound signatures redirect safely
- non-allowlisted targets cannot redirect
- submission rate limits trigger correctly
- invalid submission URLs are rejected
- monetization config disables unsafe ad placements when env is missing

**Step 2: Run the targeted tests**

Run: `npm test -- tests/unit/outbound-signature.test.ts tests/unit/request-ip.test.ts tests/unit/rate-limit.test.ts tests/unit/email-notifications.test.ts`

Run: `npm run test:e2e -- submit-page.spec.ts adsense-policy.spec.ts`

Expected: PASS or produce a short fix list before release.

**Step 3: Fix only verified gaps**

Do not refactor broadly. Fix concrete issues in redirect safety, submission robustness, environment docs, or AdSense gating.

**Step 4: Re-run the targeted tests**

Run the same commands from Step 2.

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/outbound/route.ts app/submit/actions.ts lib/monetization-config.ts .env.example README.md tests/unit/outbound-signature.test.ts tests/unit/request-ip.test.ts tests/unit/rate-limit.test.ts tests/unit/email-notifications.test.ts tests/e2e/submit-page.spec.ts tests/e2e/adsense-policy.spec.ts
git commit -m "fix: harden launch monetization and submissions"
```

### Task 5: Prove Admin Workflows and Launch-Day Monitoring

**Files:**
- Modify: `app/admin/(protected)/page.tsx`
- Modify: `app/admin/(protected)/tools/page.tsx`
- Modify: `app/admin/(protected)/categories/page.tsx`
- Modify: `app/admin/(protected)/submissions/page.tsx`
- Modify: `app/admin/(protected)/affiliate/page.tsx`
- Modify: `app/admin/(protected)/rate-limit/page.tsx`
- Modify: `lib/admin-auth.ts`
- Test: `tests/unit/admin-auth-security.test.ts`
- Test: `tests/unit/admin-audit-stats.test.ts`
- Test: `tests/unit/admin-tools-status-filter.test.ts`
- Test: `tests/e2e/admin-auth.spec.ts`
- Test: `tests/e2e/admin-tools-status-filter.spec.ts`

**Step 1: Verify the real launch-day admin journey**

The launch-day happy path should be:
`login -> dashboard -> review submissions -> inspect tools -> inspect affiliate panel -> inspect rate-limit audit`

Write or tighten tests for the above sequence before changing code.

**Step 2: Run the targeted tests**

Run: `npm test -- tests/unit/admin-auth-security.test.ts tests/unit/admin-audit-stats.test.ts tests/unit/admin-tools-status-filter.test.ts`

Run: `npm run test:e2e -- admin-auth.spec.ts admin-tools-status-filter.spec.ts`

Expected: PASS or a concrete issue list.

**Step 3: Fix only launch-blocking admin issues**

Examples:
- insecure production guard logic
- broken filtering
- empty state confusion
- missing next-action links

**Step 4: Re-run the targeted tests**

Run the same commands from Step 2.

Expected: PASS

**Step 5: Commit**

```bash
git add app/admin/(protected)/page.tsx app/admin/(protected)/tools/page.tsx app/admin/(protected)/categories/page.tsx app/admin/(protected)/submissions/page.tsx app/admin/(protected)/affiliate/page.tsx app/admin/(protected)/rate-limit/page.tsx lib/admin-auth.ts tests/unit/admin-auth-security.test.ts tests/unit/admin-audit-stats.test.ts tests/unit/admin-tools-status-filter.test.ts tests/e2e/admin-auth.spec.ts tests/e2e/admin-tools-status-filter.spec.ts
git commit -m "fix: verify launch admin workflows"
```

### Task 6: Run the Full Release Candidate Verification Pack

**Files:**
- Modify: `docs/plans/2026-03-12-commercial-sprint-verification-log.md`
- Reference: `README.md`
- Reference: `playwright.config.ts`
- Reference: `vitest.config.ts`

**Step 1: Start local services**

Run:

```bash
npm run db:up
npm run db:generate
```

Expected: PostgreSQL is available and Prisma client is generated.

**Step 2: Run the full verification pack**

Run:

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run audit:affiliate
```

Expected:
- `lint`: no blocking lint failures
- `build`: successful production build
- `test`: all Vitest suites pass
- `test:e2e`: all Playwright specs pass
- `audit:affiliate`: no unexpected affiliate-link audit failures

**Step 3: Record the evidence**

Append exact timestamps, pass/fail results, and any known waivers to:

`docs/plans/2026-03-12-commercial-sprint-verification-log.md`

**Step 4: Fix only release-blocking regressions**

If any command fails, do not start new feature work. Triage, patch, and re-run the failed command until green.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-12-commercial-sprint-verification-log.md
git commit -m "chore: record release candidate verification"
```

### Task 7: Freeze Scope and Publish the Launch Punch List

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-03-11-global-launch-master-plan.md`
- Modify: `docs/plans/2026-03-12-launch-readiness-execution-plan.md`

**Step 1: Create the punch list**

List only:
- launch blockers
- launch risks with owner
- post-launch backlog items

Do not mix future nice-to-haves into the blocker list.

**Step 2: Update the launch docs**

Add:
- current status
- owner per blocker
- target completion date
- release/no-release decision criteria

**Step 3: Review the final go/no-go standard**

A page or workflow is launch-ready only if:
- copy is intentional rather than placeholder
- links work
- analytics fire
- disclosure is visible where needed
- tests for that path are passing

**Step 4: Publish the freeze message**

Share the punch list with the team and stop opening new feature threads until blockers are closed.

**Step 5: Commit**

```bash
git add README.md docs/plans/2026-03-11-global-launch-master-plan.md docs/plans/2026-03-12-launch-readiness-execution-plan.md
git commit -m "docs: publish launch punch list"
```
