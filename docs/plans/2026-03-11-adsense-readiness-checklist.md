# AdSense Readiness Checklist

- Date: 2026-03-11
- Scope: launch templates with monetization (`/tools/[slug]`, `/use-cases/[slug]`)
- Objective: pass policy safety checks before production ad serving.

## 1) Disclosure Placement

- [x] Tool detail pages show inline disclosure plus links to:
  - [Affiliate Disclosure](/f:/www/www12/app/affiliate-disclosure/page.tsx)
  - [Editorial Policy](/f:/www/www12/app/editorial-policy/page.tsx)
- [x] Use-case detail pages show explicit disclosure statement with both links.
- [x] Footer includes disclosure and editorial policy links globally.

## 2) Thin Content Exclusion

- [x] Added policy gate utilities:
  - [adsense-policy.ts](/f:/www/www12/lib/adsense-policy.ts)
- [x] Tool detail ad rendering requires minimum content depth.
- [x] Use-case detail ad rendering requires minimum content depth.
- [x] Pages failing threshold show non-ad policy message instead of ad slot.

## 3) Sensitive Route Exclusion

- [x] Ad serving blocked by route policy for `/admin*`, `/api*`, and `/_next*`.
- [x] E2E verifies no ad slot on admin login and submit pages.

## 4) Validation Evidence

- Unit:
  - `npm test -- tests/unit/adsense-policy.test.ts`
- E2E:
  - `npm run test:e2e -- tests/e2e/adsense-policy.spec.ts tests/e2e/use-case-detail.spec.ts`
- Release pack:
  - `npm run lint`
  - `npm run build`
  - `npm test`
  - `npm run test:e2e`
  - `npm run audit:affiliate`
