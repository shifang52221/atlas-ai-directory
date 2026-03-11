# AI Agents Decision Hub (English Vertical Site)

Affiliate-first English site for AI agents and automation tool decisions.

## Tech Stack

- Next.js 16 + TypeScript
- Prisma + PostgreSQL
- Vitest (unit) + Playwright (e2e)

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Start local PostgreSQL

```bash
npm run db:up
```

3. Configure env (already seeded for local docker)

```bash
cp .env.example .env
```

4. Generate Prisma client

```bash
npm run db:generate
```

5. Run app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database Commands

```bash
npm run db:migrate
npm run db:studio
npm run db:down
```

## Test and Quality

```bash
npm run lint
npm test
npm run test:e2e
npm run build
npm run audit:affiliate
```

## Launch Status

- Master launch plan: `docs/plans/2026-03-11-global-launch-master-plan.md`
- Target code freeze: `2026-03-25`
- Target public launch: `2026-04-01`

## Current Routes

- `/`
- `/use-cases`
- `/use-cases/[slug]`
- `/compare`
- `/tools`
- `/tools/[slug]`
- `/submit`
- `/workflows`
- `/api/outbound`
- `/admin/login`
- `/admin`
- `/admin/tools`
- `/admin/tools/[slug]`
- `/admin/categories`
- `/admin/submissions`

## Monetization Config

Configure monetization via `.env`:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_TOOL_DETAIL_PRIMARY=
NEXT_PUBLIC_ADSENSE_SLOT_TOOL_DETAIL_SECONDARY=
NEXT_PUBLIC_ADSENSE_SLOT_USE_CASE_SIDEBAR=

AFFILIATE_REF_PARAM=ref
AFFILIATE_REF_VALUE=atlas
AFFILIATE_UTM_SOURCE=atlas_directory
AFFILIATE_UTM_MEDIUM=affiliate
AFFILIATE_UTM_CAMPAIGN=tool_profile

ADMIN_LOGIN_EMAIL=admin@atlas.local
ADMIN_DASHBOARD_PASSWORD=atlas-admin
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

OUTBOUND_SIGNING_SECRET=replace-with-a-long-random-secret
ANALYTICS_SESSION_SALT=replace-with-a-long-random-secret
AFFILIATE_HUB_MIN_IMPRESSIONS_PER_VARIANT=20
AFFILIATE_HUB_MIN_ABSOLUTE_LIFT=0.10
SUBMIT_RATE_LIMIT_MAX=12
SUBMIT_RATE_LIMIT_WINDOW_MINUTES=10
ADMIN_LOGIN_RATE_LIMIT_MAX=15
ADMIN_LOGIN_RATE_LIMIT_WINDOW_MINUTES=10

RESEND_API_KEY=
NOTIFY_FROM_EMAIL="Atlas AI <no-reply@yourdomain.com>"
NOTIFY_ADMIN_EMAIL=you@yourdomain.com
APP_BASE_URL=http://localhost:3000
```

## Production Environment Checklist

Before production deploy, validate:

1. `APP_BASE_URL` is the final domain (https).
2. `ADMIN_DASHBOARD_PASSWORD` is strong/random (>= 20 chars).
3. `ADMIN_SESSION_SECRET` is strong/random (>= 32 chars).
4. `OUTBOUND_SIGNING_SECRET` is strong/random (>= 32 chars).
5. `DATABASE_URL` points to production DB with least-privilege user.
6. Resend + AdSense keys are configured if those features are enabled.

Recommended verification command pack before each release candidate:

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run audit:affiliate
```

Rate-limit audit entries are appended to `dev.log` with:
- `scope: "rate_limit"`
- `bucket`, `ip`, `allowed`, `remaining`, `retryAfterMs`
