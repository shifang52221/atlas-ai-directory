# Admin Production Config Enforcement Design

## Goal

Prove and strengthen the admin login guard that rejects insecure production configuration so the launch security gate has concrete evidence rather than implied safety.

## Scope

This design is limited to admin authentication production-config enforcement and its tests:

- `lib/admin-auth.ts`
- `app/admin/login/actions.ts`
- `tests/e2e/admin-auth.spec.ts`
- one focused unit test file if needed for production-config rules

This design does not include:

- outbound redirect hardening
- admin UI redesign
- database schema changes
- new secrets-management infrastructure
- broader security audit work outside admin auth

## Problem

The codebase already contains production-specific admin security checks, including `isAdminAuthConfigSecureForProduction` and an `insecure_production_config` login failure path. That is a strong starting point, but it is not yet enough to confidently close this part of the Security gate.

The remaining gap is proof and enforcement clarity:

- the production-config rules need direct test coverage
- the login failure behavior needs to be shown as intentional and stable
- the normal login path must remain intact under valid configuration

Without that evidence, the project still has a "looks secure" posture instead of a "proven secure for this slice" posture.

## Recommended Approach

Keep the scope narrow and test-driven:

- add focused tests for production-config security rules
- verify that insecure production config causes a stable login rejection
- preserve existing valid-login and rate-limit behavior
- make only minimal implementation changes required to satisfy those tests

## Alternatives Considered

### Option 1: Add direct unit coverage for production-config rules and minimally tighten login enforcement

Pros:

- smallest change surface
- provides direct evidence for the Security gate
- avoids inflating e2e scope for environment-specific edge cases

Cons:

- only clears one security slice, not the whole gate

### Option 2: Expand admin e2e coverage to simulate all insecure production scenarios

Pros:

- stronger end-to-end confidence

Cons:

- heavier setup complexity
- more brittle and slower than necessary for this scope

### Option 3: Bundle admin production enforcement with outbound hardening in one sprint

Pros:

- broader apparent security progress

Cons:

- much larger regression surface
- violates the current "clear one blocker slice at a time" strategy

## Chosen Design

Adopt Option 1.

We will use a focused unit-first approach to prove that production admin auth is only considered secure when:

- `ADMIN_LOGIN_EMAIL` is present and valid
- `ADMIN_DASHBOARD_PASSWORD` is strong enough and not a placeholder
- `ADMIN_SESSION_SECRET` is long enough and not a placeholder

Then we will confirm that the login flow rejects insecure production configuration while preserving current valid-login behavior.

## Testing Strategy

Use two layers of verification:

1. Focused unit tests for `isAdminAuthConfigSecureForProduction`
   - invalid production email rejected
   - weak or placeholder production password rejected
   - short or placeholder session secret rejected
   - valid production config accepted

2. Existing admin auth regression coverage
   - verify no regression in normal admin route protection and valid login behavior
   - only add e2e assertions if needed to cover an intentional production-config rejection path

## Success Criteria

This work is complete when:

- production admin config rules have direct automated test coverage
- insecure production config is intentionally rejected
- valid existing admin login behavior still works
- the change remains limited to the admin production-config slice
