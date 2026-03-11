# Production Environment Hardening Checklist

Date: 2026-03-11
Scope: Atlas AI Directory production deployment

## 1. Required Environment Variables

Critical (must be non-empty and strong):
- `APP_BASE_URL`
- `DATABASE_URL`
- `ADMIN_DASHBOARD_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `OUTBOUND_SIGNING_SECRET`

Optional by feature:
- `RESEND_API_KEY`
- `NEXT_PUBLIC_ADSENSE_CLIENT`
- AdSense slot ids

## 2. Strength Requirements

- `ADMIN_DASHBOARD_PASSWORD`: >= 20 chars, random, no dictionary-only password.
- `ADMIN_SESSION_SECRET`: >= 32 chars random.
- `OUTBOUND_SIGNING_SECRET`: >= 32 chars random.

## 3. Production Safety Checks

1. `APP_BASE_URL` uses final HTTPS domain.
2. Admin credentials are not default/sample values.
3. Secrets are stored only in deployment secret manager.
4. No secrets committed in repository files.
5. `.env.example` remains placeholder-safe.

## 4. Pre-Deploy Verification

Run with production-like env values:

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

Expected:
- All commands pass.

## 5. Deployment Platform Checklist

- Configure all required env vars in deployment dashboard.
- Confirm environment is set for both build and runtime contexts.
- Rotate secrets after any accidental exposure.
- Keep rollback release ready.

## 6. Sign-Off

- Engineering: Pending
- Ops/Infra: Pending
- Security reviewer: Pending
