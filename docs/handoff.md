# Project Handoff

## Overview

This repository is an English AI tools directory built for affiliate-driven discovery, comparison, and commercial-intent editorial traffic.

The product is not just a content site. It combines:

- public directory and tool detail pages
- use-case landing pages
- commercial editorial hubs such as `best-*`, `*-alternatives`, and `vs` pages
- signed outbound affiliate redirects
- an admin area for operations, submissions, categories, affiliate analysis, and rate-limit review

Primary references:

- [README.md](/f:/www/www12/README.md)
- [Launch Master Plan](/f:/www/www12/docs/plans/2026-03-11-global-launch-master-plan.md)

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma
- PostgreSQL
- Vitest for unit tests
- Playwright for end-to-end tests

Key files:

- [package.json](/f:/www/www12/package.json)
- [schema.prisma](/f:/www/www12/prisma/schema.prisma)

## Repository Map

### App Layer

Public routes and API routes live in [app](/f:/www/www12/app).

Important entries:

- [app/page.tsx](/f:/www/www12/app/page.tsx)
- [app/tools/page.tsx](/f:/www/www12/app/tools/page.tsx)
- [app/tools/[slug]/page.tsx](/f:/www/www12/app/tools/[slug]/page.tsx)
- [app/use-cases/page.tsx](/f:/www/www12/app/use-cases/page.tsx)
- [app/use-cases/[slug]/page.tsx](/f:/www/www12/app/use-cases/[slug]/page.tsx)
- [app/api/outbound/route.ts](/f:/www/www12/app/api/outbound/route.ts)
- [app/api/analytics/hub-impression/route.ts](/f:/www/www12/app/api/analytics/hub-impression/route.ts)
- [app/admin/(protected)/layout.tsx](/f:/www/www12/app/admin/(protected)/layout.tsx)

### Business Logic Layer

Shared data loading, auth, monetization, and analytics logic live in [lib](/f:/www/www12/lib).

Most important files to understand first:

- [lib/homepage-data.ts](/f:/www/www12/lib/homepage-data.ts)
- [lib/tools-directory-data.ts](/f:/www/www12/lib/tools-directory-data.ts)
- [lib/tool-profile-data.ts](/f:/www/www12/lib/tool-profile-data.ts)
- [lib/use-case-data.ts](/f:/www/www12/lib/use-case-data.ts)
- [lib/monetization-config.ts](/f:/www/www12/lib/monetization-config.ts)
- [lib/outbound-signature.ts](/f:/www/www12/lib/outbound-signature.ts)
- [lib/admin-auth.ts](/f:/www/www12/lib/admin-auth.ts)
- [lib/affiliate-performance.ts](/f:/www/www12/lib/affiliate-performance.ts)
- [lib/db.ts](/f:/www/www12/lib/db.ts)

### Editorial Hub System

Commercial-intent pages are driven by shared hub config and a reusable template.

Key files:

- [lib/editorial-hubs.ts](/f:/www/www12/lib/editorial-hubs.ts)
- [components/editorial-hub-page.tsx](/f:/www/www12/components/editorial-hub-page.tsx)
- [proxy.ts](/f:/www/www12/proxy.ts)

### Tests

Unit and e2e coverage live in [tests](/f:/www/www12/tests).

Key areas:

- [tests/unit](/f:/www/www12/tests/unit)
- [tests/e2e](/f:/www/www12/tests/e2e)

## How Data Flows

The most important implementation pattern in this codebase is:

`database first, fallback content second`

This applies to the homepage, tools directory, tool profiles, and use-case pages.

Behavior:

- the app tries to query Prisma-backed content first
- if the DB is unavailable or data is missing, code-level fallback seeds keep the site functional
- outbound URLs are routed through a signed redirect layer instead of linking directly to target vendors

This pattern is useful, but it means environment differences can change behavior quickly. Always consider whether you are looking at DB-backed data or fallback content.

## Operationally Sensitive Areas

### 1. Outbound Redirect Security

All monetized outbound traffic should pass through the redirect route:

- [app/api/outbound/route.ts](/f:/www/www12/app/api/outbound/route.ts)

Guardrails include:

- signed requests
- target URL allowlisting
- affiliate link validation
- click event recording

If this route regresses, the project can lose attribution or open itself to redirect abuse.

### 2. Admin Authentication

Admin access is enforced in:

- [lib/admin-auth.ts](/f:/www/www12/lib/admin-auth.ts)

Production safety depends on:

- strong `ADMIN_DASHBOARD_PASSWORD`
- strong `ADMIN_SESSION_SECRET`
- valid `ADMIN_LOGIN_EMAIL`
- correct environment setup

### 3. Commercial Editorial Hubs

These pages are important for both SEO and revenue. They depend on:

- correct metadata and JSON-LD
- correct CTA generation
- variant handling through [proxy.ts](/f:/www/www12/proxy.ts)
- impression tracking through [app/api/analytics/hub-impression/route.ts](/f:/www/www12/app/api/analytics/hub-impression/route.ts)

### 4. Environment-Sensitive Behavior

Important environment-driven settings include:

- `DATABASE_URL`
- `APP_BASE_URL`
- `ADMIN_LOGIN_EMAIL`
- `ADMIN_DASHBOARD_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `OUTBOUND_SIGNING_SECRET`
- `RESEND_API_KEY`
- public AdSense slot variables

Reference:

- [.env.example](/f:/www/www12/.env.example)

## Current Assessment

As of the latest local review:

- `npm run lint` passed
- `npm run build` passed
- `npm test` passed on a later rerun

One caution from review:

- an earlier full unit-test run showed two timeouts before later reruns passed

That means the codebase currently looks usable, but validation stability should still be watched. Treat the project as launch hardening work, not as a carefree feature sprint.

## First Files To Read

If you are taking over the project, start here in this order:

1. [README.md](/f:/www/www12/README.md)
2. [lib/homepage-data.ts](/f:/www/www12/lib/homepage-data.ts)
3. [lib/tool-profile-data.ts](/f:/www/www12/lib/tool-profile-data.ts)
4. [lib/use-case-data.ts](/f:/www/www12/lib/use-case-data.ts)
5. [app/api/outbound/route.ts](/f:/www/www12/app/api/outbound/route.ts)
6. [lib/admin-auth.ts](/f:/www/www12/lib/admin-auth.ts)
7. [lib/editorial-hubs.ts](/f:/www/www12/lib/editorial-hubs.ts)
8. [app/admin/(protected)/affiliate/page.tsx](/f:/www/www12/app/admin/(protected)/affiliate/page.tsx)

## Recommended First Week

### Day 1

- verify environment variables
- confirm database connectivity
- run baseline commands twice:
  - `npm run lint`
  - `npm test`
  - `npm run build`

### Day 2

- review current git worktree state
- group pending changes into:
  - content pages
  - commercial pages
  - backend or security logic
  - tests and docs

### Day 3

- validate outbound affiliate flow end to end
- validate admin login and protected route behavior
- check one or two commercial hub pages for variant behavior and CTA integrity

### Day 4

- review sitemap, robots, metadata, and canonical URLs
- spot-check structured data on homepage, tool detail, and one editorial hub

### Day 5

- decide whether the project is in:
  - stable release-candidate mode
  - hardening mode
  - blocked mode

## Minimum Release Command Pack

Run this before any serious release decision:

```bash
npm run lint
npm test
npm run build
npm run audit:affiliate
```

## Release Mindset

The main risk in this repository is not missing content volume.

The real risks are:

- unstable validation
- environment drift
- mixed release scope in a dirty worktree
- regressions in affiliate attribution or redirect safety
- SEO or metadata mistakes on high-intent pages

The safest way to work in this codebase is to prioritize verification and release discipline before adding more content or experiments.
