# Atlas AI Directory Launch KPI Contract

Date: 2026-03-11
Owner: Product + Engineering
Scope Version: v1.0 (frozen for 2026-04-01 launch)

## 1. Launch KPIs

### KPI-1: Organic Indexing Coverage (Day 14)

Definition:
- Number of indexable launch URLs discovered and indexed in Google Search Console within 14 days after public launch.

Target:
- >= 80% of launch-scope URLs indexed by 2026-04-15.

Launch URL scope:
- Home, tools listing, use-cases listing, compare, workflows
- 4 editorial hubs
- Policy pages
- Priority tool detail pages in launch shortlist

Data source:
- Google Search Console indexing report + submitted sitemap URLs.

Owner:
- SEO/Content owner.

---

### KPI-2: Editorial Hub Outbound CTR (Week 1 baseline)

Definition:
- Hub CTR = outbound clicks / tracked hub impressions.

Target:
- Establish baseline by day 7 for all 4 hubs.
- At least 2 hubs with CTR >= 10% in week 1.

Data source:
- Admin affiliate dashboard (`/admin/affiliate`) hub CTR and trend panels.

Owner:
- Monetization + Content owner.

---

### KPI-3: Affiliate Click Quality and Backfill Cadence

Definition:
- Click tracking write success and link health for launch-scope affiliate links.
- Manual conversion backfill performed on fixed cadence.

Target:
- Broken affiliate links in launch scope: 0.
- Tracking write failure rate: <= 2% during launch week.
- Backfill cadence: at least every 48 hours in first 14 days.

Data source:
- Admin affiliate dashboard + outbound QA report + audit logs.

Owner:
- Monetization + Ops owner.

---

## 2. Non-Goals for This Launch

1. No multilingual rollout (English-only launch).
2. No user account system for public visitors.
3. No personalized recommendation model.
4. No additional product surfaces outside current launch routes.

---

## 3. Scope Freeze Rules

Freeze date:
- 2026-03-25 (Code Freeze)

Allowed after freeze:
- P0/P1 bug fixes.
- Security fixes.
- Copy edits without structural changes.
- Tracking fix-ups that do not change URL/public contracts.

Not allowed after freeze:
- New feature modules.
- New route families.
- Data model expansions unless required for incident fix.

---

## 4. Go/No-Go KPI Conditions

Go condition requires all:
1. Gate A-E from launch master plan are green.
2. KPI instrumentation exists and is verifiable.
3. Release candidate full command pack green in last 24h.

No-Go if any:
1. KPI instrumentation missing for any launch-critical surface.
2. Affiliate link health is not fully verified.
3. Security gate not fully green.

---

## 5. Sign-Off

- Product: Pending
- Engineering: Pending
- SEO/Content: Pending
- Monetization/Ops: Pending
