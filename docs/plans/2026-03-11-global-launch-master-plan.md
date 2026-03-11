# Atlas AI Directory Launch Master Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Launch the English affiliate-first AI navigation site with strong UX, strong SEO, and production-safe monetization by April 1, 2026.

**Architecture:** Execute in parallel workstreams with a single critical path: security and production readiness -> content and SEO completeness -> monetization and analytics validation -> launch rehearsal -> public launch. Every change must be test-driven when code is touched and must pass lint/build/unit/e2e before release candidates.

**Tech Stack:** Next.js 16, TypeScript, Prisma, PostgreSQL, Vitest, Playwright, App Router metadata, JSON-LD structured data.

---

## 0. Current Baseline (As of 2026-03-11)

### Already complete

- Core site routes, editorial hubs, policy pages, admin panel, submission flow.
- Affiliate click tracking and signed outbound links.
- Hub A/B pipeline:
  - URL variant parsing (`?variant=a|b`)
  - impression and outbound variant tracking
  - admin experiment CTR table
  - significance metrics (`p-value`, confidence)
  - decision cards (`SHIP_B`, `KEEP_A`, `RUN_LONGER`)
- Technical quality baseline:
  - `npm run lint` pass
  - `npm run build` pass
  - `npm test` pass
  - `npm run test:e2e` pass

### Remaining before launch

- Production infra and secrets hardening.
- Compliance-grade monetization and AdSense readiness.
- Content depth and editorial consistency at scale.
- SEO final pass (metadata, indexing hygiene, internal links, crawl health).
- Launch rehearsal and rollback readiness.

---

## 1. Launch Date and Milestones

- **T0 (Today):** 2026-03-11 (Wednesday)
- **Code Freeze Target:** 2026-03-25 (Wednesday)
- **Staging Dress Rehearsal:** 2026-03-27 (Friday)
- **Soft Launch:** 2026-03-30 (Monday)
- **Public Launch:** 2026-04-01 (Wednesday)

---

## 2. Launch Gates (Must All Be Green)

- **Gate A: Security**
  - No open redirect abuse path.
  - Admin auth secrets set and no weak production defaults.
  - Login and submit anti-abuse active.
- **Gate B: SEO**
  - Canonical, title, description, schema valid for all indexable pages.
  - Sitemap and robots production-valid.
  - GSC property + sitemap submitted.
- **Gate C: Monetization**
  - Affiliate links verified and disclosure placements complete.
  - AdSense policy risk checklist passed.
- **Gate D: Quality**
  - Full automated suite green.
  - Manual QA matrix complete.
- **Gate E: Operations**
  - Backup/restore drill done.
  - Monitoring and alerts active.
  - Rollback procedure tested.

---

## 3. Master Work Breakdown Structure (Very Detailed)

### Task 1: Scope Freeze and KPI Contract

**Files:**
- Create: `docs/plans/2026-03-11-launch-kpi-contract.md`
- Modify: `README.md` (launch section)

**Step 1: Define launch KPIs**
- KPI-1: Organic indexed pages in 14 days.
- KPI-2: Hub outbound CTR baseline and trend.
- KPI-3: Affiliate click quality and conversion backfill cadence.

**Step 2: Define non-goals (avoid scope creep)**
- No multilingual rollout in this launch.
- No custom recommendation engine in this launch.
- No advanced user account system in this launch.

**Step 3: Freeze release scope**
- Lock page set for launch.
- Lock data model changes allowed after freeze (critical bug only).

**Step 4: Commit KPI contract doc**
- Artifact: signed-off KPI contract in docs.

**Definition of Done:**
- KPI contract approved.
- Scope freeze checklist signed.

---

### Task 2: Production Environment and Secret Hardening

**Files:**
- Modify: `.env.example`
- Modify: `README.md` (production env setup)
- Verify: deployment platform env configuration

**Step 1: Inventory required secrets**
- `APP_BASE_URL`
- `ADMIN_SESSION_SECRET`
- `OUTBOUND_SIGNING_SECRET`
- `ADMIN_DASHBOARD_PASSWORD`
- `DATABASE_URL`
- mail/ad envs

**Step 2: Enforce non-default production values**
- Document and validate length/entropy requirements.

**Step 3: Add production bootstrap checklist**
- Include exact env var validation command/runbook.

**Step 4: Validate app in production-like env**
Run: `npm run build`
Expected: PASS with production env values.

**Definition of Done:**
- No weak or empty critical secret in production.
- Env checklist completed and documented.

---

### Task 3: Database Readiness and Data Safety

**Files:**
- Verify: `prisma/schema.prisma`
- Create: `docs/plans/2026-03-11-db-backup-restore-runbook.md`

**Step 1: Confirm migration baseline**
Run: `npm run db:generate`
Expected: Prisma client generated without warnings.

**Step 2: Create backup policy**
- Daily snapshot cadence.
- 7/30-day retention.
- Restore owner and SLA.

**Step 3: Run restore simulation on staging DB**
- Restore latest backup.
- Validate key tables (`Tool`, `ClickEvent`, `User`, `AffiliateLink`).

**Step 4: Record recovery timings**
- RTO (recovery time objective).
- RPO (recovery point objective).

**Definition of Done:**
- Backup + restore drill proven and documented.

---

### Task 4: Outbound Redirect and Abuse Hardening

**Files:**
- Modify: `app/api/outbound/route.ts`
- Test: `tests/e2e/tool-detail.spec.ts`
- Test: `tests/unit/outbound-signature.test.ts`

**Step 1: Add failing security tests for target mismatch abuse**
- Reject targets not bound to known tool/link context.

**Step 2: Run tests to verify failure first**
Run: `npm test -- tests/unit/outbound-signature.test.ts`
Expected: FAIL for new abuse case.

**Step 3: Implement strict allowlist logic**
- Validate target against DB-backed link set when possible.
- Keep signed URL validation as mandatory pre-check.

**Step 4: Re-run targeted tests**
Run: `npm test -- tests/unit/outbound-signature.test.ts`
Expected: PASS.

**Step 5: Re-run e2e outbound flows**
Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`
Expected: PASS.

**Definition of Done:**
- No open redirect vector for arbitrary target URLs.

---

### Task 5: Admin Auth and Anti-Abuse Hardening

**Files:**
- Verify/Modify: `lib/admin-auth.ts`
- Modify: `app/admin/login/actions.ts`
- Test: `tests/e2e/admin-auth.spec.ts`

**Step 1: Add failing tests for production default rejection**
- Production mode should reject missing/weak critical admin settings.

**Step 2: Implement enforcement and audit logging**
- Deny login if production secret/password invalid.
- Keep audit entries with explicit reasons.

**Step 3: Validate rate-limit + lockout behavior**
Run: `npm run test:e2e -- tests/e2e/admin-auth.spec.ts`
Expected: PASS with blocked brute-force scenarios.

**Definition of Done:**
- Admin login is safe under brute-force and misconfig risk.

---

### Task 6: Technical SEO Finalization

**Files:**
- Verify/Modify: `app/tools/page.tsx`
- Verify/Modify: `app/use-cases/page.tsx`
- Verify/Modify: `app/compare/page.tsx`
- Verify/Modify: `app/workflows/page.tsx`
- Verify: `app/sitemap.ts`
- Verify: `app/robots.ts`
- Test: `tests/e2e/core-seo-jsonld.spec.ts`
- Test: `tests/e2e/technical-seo-routes.spec.ts`

**Step 1: Ensure unique metadata on all listing pages**
- title, description, canonical, OG/Twitter where applicable.

**Step 2: Validate sitemap includes money pages and details**
- home, tools, use-cases, hubs, policy pages, dynamic details.

**Step 3: Validate robots correctness for production**
- allow crawl public routes, disallow admin.

**Step 4: Run SEO e2e pack**
Run: `npm run test:e2e -- tests/e2e/core-seo-jsonld.spec.ts tests/e2e/technical-seo-routes.spec.ts`
Expected: PASS.

**Definition of Done:**
- Canonical/indexation/schema checks green on all indexable routes.

---

### Task 7: Editorial Content Completion (Content is King)

**Files:**
- Modify: `lib/editorial-hubs.ts`
- Modify: `app/tools/[slug]/page.tsx`
- Create/Update: content source docs in `docs/plans/` for editorial QA

**Step 1: Complete launch content matrix**
- 4 editorial hubs complete and internally linked.
- Top money tool profiles finalized.

**Step 2: Add evidence-backed editing pass**
- Each commercial claim must be concrete and non-generic.
- Remove repetitive wording across hubs.

**Step 3: Standardize CTA/disclosure language**
- Maintain clear affiliate disclosure consistency.

**Step 4: Run content QA checklist**
- grammar, clarity, unique value, conversion intent, compliance wording.

**Definition of Done:**
- All launch pages pass editorial QA rubric.

---

### Task 8: Internal Linking and Crawl Depth Optimization

**Files:**
- Modify: `components/site-footer.tsx`
- Modify: `components/editorial-hub-page.tsx`
- Verify: `app/page.tsx`, `app/tools/page.tsx`, `app/use-cases/page.tsx`

**Step 1: Build priority internal link graph**
- Home -> hubs -> tools -> compare/use-cases/workflows -> policy.

**Step 2: Ensure money pages are <= 3 clicks from home**
- Add contextual links where depth exceeds threshold.

**Step 3: Validate no orphan critical pages**
- Confirm every launch URL has at least one in-site inbound link.

**Definition of Done:**
- Internal link map documented and validated.

---

### Task 9: Affiliate Link Governance and QA

**Files:**
- Verify: admin tools/affiliate actions and DB records
- Verify: `app/api/outbound/route.ts`
- Verify: `lib/tool-profile-data.ts`

**Step 1: Build link inventory by tool and region**
- Primary link, fallback link, last verified date.

**Step 2: Batch verify redirect outcomes**
- 200/3xx expected.
- no dead links.

**Step 3: Verify tracking params and signature integrity**
- Confirm all generated links remain signed and valid.

**Step 4: Record monetization QA report**
- Broken links count must be zero pre-launch.

**Definition of Done:**
- 100% active affiliate links in launch scope.

---

### Task 10: AdSense Readiness and Policy Safety

**Files:**
- Verify ad slot env usage in pages/components
- Create: `docs/plans/2026-03-11-adsense-readiness-checklist.md`

**Step 1: Validate disclosure placement rules**
- Disclosure visible on monetized pages.

**Step 2: Validate thin/placeholder content is excluded from ads**
- Ensure policy-safe content density.

**Step 3: Validate sensitive page exclusions**
- admin/login/internal routes should never render ad units.

**Step 4: Run manual policy pre-check**
- invalid traffic risk notes.
- accidental click risk review.

**Definition of Done:**
- AdSense pre-checklist fully green.

---

### Task 11: Analytics Completion (Funnel + Attribution)

**Files:**
- Modify: `app/api/outbound/route.ts`
- Modify: `app/api/analytics/hub-impression/route.ts`
- Modify: `lib/affiliate-performance.ts`
- Modify: `app/admin/(protected)/affiliate/page.tsx`
- Test: `tests/unit/affiliate-performance.test.ts`

**Step 1: Ensure metadata fields are consistent**
- pagePath, toolSlug, linkKind, variant, module/placement ids where needed.

**Step 2: Add missing dimensions if required**
- session hash and country code strategy (privacy-safe).

**Step 3: Add dashboard slices for decision making**
- by hub, by variant, by tool, by period.

**Step 4: Validate trend correctness with controlled fixtures**
Run: `npm test -- tests/unit/affiliate-performance.test.ts`
Expected: PASS.

**Definition of Done:**
- Weekly optimization can be run from dashboard data only.

---

### Task 12: A/B Experiment Operations (Current Feature Completion)

**Files:**
- Modify: `app/admin/(protected)/affiliate/page.tsx`
- Modify: `lib/affiliate-performance.ts`
- Test: `tests/unit/affiliate-performance.test.ts`

**Step 1: Add window-based experiment filtering (7d/30d/90d consistency)**
- Ensure decision cards and table use same selected window.

**Step 2: Add recommendation thresholds config**
- min lift, min impressions per variant.

**Step 3: Add decision audit trail export**
- Snapshot recommended actions before each rollout.

**Step 4: Validate with tests and manual admin QA**
Run: `npm test -- tests/unit/affiliate-performance.test.ts`
Expected: PASS.

**Definition of Done:**
- Experiment workflow can run end-to-end weekly with auditable decisions.

---

### Task 13: Performance and Core Web Vitals Hardening

**Files:**
- Verify: `app/page.tsx`, hub pages, tool detail pages
- Verify: image/font usage
- Create: `docs/plans/2026-03-11-cwv-optimization-checklist.md`

**Step 1: Capture baseline on staging**
- LCP, CLS, INP on home + hub + tool detail.

**Step 2: Optimize largest elements and layout stability**
- Remove avoidable layout shifts.
- optimize heavy paint sections.

**Step 3: Re-measure after optimization**
- Track before/after report.

**Definition of Done:**
- Launch templates meet target CWV thresholds.

---

### Task 14: Automated QA Freeze Suite

**Files:**
- Verify all existing test files
- Optional create: CI workflow file when deployment platform selected

**Step 1: Define release candidate command pack**
Run:
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run test:e2e`

**Step 2: Save command outputs as release artifact**
- Keep timestamped run logs for RC-1, RC-2.

**Step 3: Block release if any pack step fails**
- no exceptions.

**Definition of Done:**
- Every release candidate has full green evidence.

---

### Task 15: Manual QA Matrix (Desktop + Mobile)

**Files:**
- Create: `docs/plans/2026-03-11-manual-qa-matrix.md`

**Step 1: Define browser/device matrix**
- Chrome desktop/mobile.
- Safari mobile.
- Edge desktop.

**Step 2: Define flows**
- Hub browse -> outbound click.
- Tool browse -> profile -> outbound click.
- Submit flow and validation.
- Admin login and action saves.

**Step 3: Execute matrix and log defects**
- severity, route, repro steps, fix owner.

**Definition of Done:**
- P0/P1 manual defects = 0.

---

### Task 16: Pre-Launch Dress Rehearsal (Staging)

**Files:**
- Create: `docs/plans/2026-03-11-launch-dry-run.md`

**Step 1: Run full launch checklist in staging exactly as production**
- secrets, DB, build, migrations, smoke tests.

**Step 2: Execute synthetic traffic tests**
- verify analytics ingestion and dashboards.

**Step 3: Execute rollback simulation**
- rollback previous release and verify recovery time.

**Definition of Done:**
- Dry run complete with explicit go/no-go recommendation.

---

### Task 17: Launch Day Runbook (2026-04-01)

**Files:**
- Create: `docs/plans/2026-03-11-launch-day-runbook.md`

**Step 1: T-120min checks**
- infra healthy.
- DB healthy.
- secrets verified.

**Step 2: T-60min release candidate final pass**
Run:
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run test:e2e`

**Step 3: T-15min content and link spot check**
- top 10 revenue pages.

**Step 4: T0 release + immediate smoke checks**
- home, hubs, top tools, submit, admin.

**Step 5: T+30/T+120 monitoring window**
- error rate, latency, click tracking writes.

**Definition of Done:**
- Launch live with zero P0 production incident.

---

### Task 18: Post-Launch 14-Day Optimization Loop

**Files:**
- Create: `docs/plans/2026-03-11-post-launch-14d-playbook.md`

**Step 1: Daily 30-minute ops review**
- incidents, crawl/index changes, CTR movement.

**Step 2: Every 48h content refresh on weakest hubs**
- tighten hero copy, reorder cards using evidence.

**Step 3: Weekly experiment decision checkpoint**
- ship/hold decisions from admin conclusions.

**Step 4: Produce day-14 report**
- SEO, monetization, content velocity, technical debt backlog.

**Definition of Done:**
- Day-14 report approved and next sprint backlog created.

---

## 4. Calendar Plan (Date-by-Date)

### 2026-03-12 to 2026-03-15

- Task 1, Task 2, Task 3 complete.
- Security hardening implementation starts (Task 4, Task 5).

### 2026-03-16 to 2026-03-19

- Task 4 and Task 5 complete.
- Task 6 (SEO finalization) and Task 8 (internal linking) complete.
- Task 9 affiliate link QA starts.

### 2026-03-20 to 2026-03-23

- Task 7 content completion.
- Task 9 affiliate QA complete.
- Task 10 AdSense readiness complete.
- Task 11 analytics completion complete.

### 2026-03-24 to 2026-03-25

- Task 12 experiment ops completion.
- Task 13 CWV optimization complete.
- Task 14 freeze suite pass for RC-1.
- **Code Freeze:** 2026-03-25.

### 2026-03-26 to 2026-03-27

- Task 15 manual QA matrix complete.
- Task 16 staging dress rehearsal complete.

### 2026-03-30

- Soft launch and observation window.
- Fix only critical issues.

### 2026-04-01

- Task 17 launch day runbook execution.
- Public launch decision at go/no-go checkpoint.

### 2026-04-02 to 2026-04-15

- Task 18 post-launch loop.

---

## 5. Go/No-Go Decision Sheet

### Go if all true

- Gate A/B/C/D/E all green.
- No unresolved P0/P1 defects.
- Release candidate full command pack green within 24h.
- Rollback simulation proven within target RTO.

### No-Go triggers

- Security regression on outbound/admin auth.
- Affiliate click tracking write failure rate > 2% during rehearsal.
- Major SEO metadata/canonical defects on core money pages.
- Manual QA has unresolved checkout-like or monetization-critical defects.

---

## 6. Risk Register and Contingency

- **Risk:** Affiliate network link changes at launch week.
  - **Mitigation:** freeze verified link inventory + rapid replacement process.
- **Risk:** AdSense review or policy delay.
  - **Mitigation:** launch affiliate-first; keep ad slots feature-flagged.
- **Risk:** Unexpected DB latency spikes.
  - **Mitigation:** cache high-read routes and reduce heavy admin queries.
- **Risk:** SEO indexing slower than expected.
  - **Mitigation:** stronger internal links, sitemap resubmit, recrawl high-value URLs.

---

## 7. Definition of Launch Complete

- Site is publicly available on production domain.
- Tracking data is flowing and visible in admin dashboards.
- All must-pass tests and launch checklists are archived.
- Day-14 optimization playbook is running with owners and cadence.

---

## 8. Daily Execution Command Pack

Use this exact pack at end of each implementation day:

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

Expected: all pass. If any fail, do not mark the day complete.
