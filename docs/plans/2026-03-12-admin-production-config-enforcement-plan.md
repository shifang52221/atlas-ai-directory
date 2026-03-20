# Admin Production Config Enforcement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prove and enforce that admin login rejects insecure production configuration while preserving valid login behavior.

**Architecture:** The implementation stays within the existing admin auth stack. We will use TDD to first add focused automated coverage for the production-config rules in `lib/admin-auth.ts`, then make only the smallest implementation changes needed so insecure production configuration is rejected intentionally and normal admin login behavior remains green.

**Tech Stack:** TypeScript, Vitest, Playwright, Next.js 16

---

### Task 1: Lock the Production Config Security Rules

**Files:**
- Create: `tests/unit/admin-auth.test.ts`
- Reference: `lib/admin-auth.ts`

**Step 1: Write the failing test**

Add direct unit coverage for `isAdminAuthConfigSecureForProduction` proving that in `production`:

- missing or invalid admin email returns `false`
- weak or placeholder admin password returns `false`
- short or placeholder session secret returns `false`
- sufficiently strong email/password/secret returns `true`

Keep the test focused on the rule function rather than mocking the full login flow.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/admin-auth.test.ts`

Expected: FAIL because the new production-config assertions are not yet covered or one or more edge cases are not yet enforced as expected.

**Step 3: Write minimal implementation**

Update only the admin-auth production security logic needed to satisfy the new tests.

**Step 4: Re-run the same unit test**

Run: `npm test -- tests/unit/admin-auth.test.ts`

Expected: PASS

### Task 2: Prove the Login Flow Preserves Valid Behavior

**Files:**
- Modify: `lib/admin-auth.ts`
- Reference: `app/admin/login/actions.ts`
- Test: `tests/e2e/admin-auth.spec.ts`

**Step 1: Confirm the existing admin login regression path**

Keep the current login flow stable:

- route protection still redirects unauthenticated users
- valid credentials still allow access in non-production test conditions
- rate-limit behavior remains unchanged

Only touch implementation if the new unit-level security tightening introduced a regression.

**Step 2: Run the admin auth e2e test**

Run: `npm run test:e2e -- tests/e2e/admin-auth.spec.ts`

Expected: PASS

**Step 3: Fix only admin production-config regressions if needed**

If the e2e test fails, limit fixes to:

- admin auth production-config logic
- admin login failure-path handling directly related to this slice

**Step 4: Re-run the same e2e test**

Run: `npm run test:e2e -- tests/e2e/admin-auth.spec.ts`

Expected: PASS

### Task 3: Run Focused Security-Slice Verification

**Files:**
- Reference: `tests/unit/admin-auth.test.ts`
- Reference: `tests/e2e/admin-auth.spec.ts`

**Step 1: Run the focused verification pack**

Run: `npm test -- tests/unit/admin-auth.test.ts`

Expected: PASS

**Step 2: Run the admin e2e pack**

Run: `npm run test:e2e -- tests/e2e/admin-auth.spec.ts`

Expected: PASS

**Step 3: Re-check the diff scope**

Run: `git diff -- lib/admin-auth.ts app/admin/login/actions.ts tests/unit/admin-auth.test.ts tests/e2e/admin-auth.spec.ts`

Expected: The change stays limited to admin production-config enforcement and its verification coverage.
