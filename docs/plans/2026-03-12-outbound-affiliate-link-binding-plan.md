# Outbound Affiliate Link Binding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prove and enforce that outbound requests carrying an `affiliateLinkId` can only redirect to targets actually bound to that affiliate link.

**Architecture:** The implementation stays within the existing outbound route. We will use TDD to first add a request-level regression test in `tests/e2e/tool-detail.spec.ts`, then make only the smallest update needed in `app/api/outbound/route.ts` if the test exposes a real target-binding gap.

**Tech Stack:** TypeScript, Playwright, Next.js 16

---

### Task 1: Lock the Affiliate-Link Target Binding Rule

**Files:**
- Modify: `tests/e2e/tool-detail.spec.ts`
- Reference: `app/api/outbound/route.ts`

**Step 1: Write the failing test**

Add a focused outbound-route test proving that a correctly signed request is still rejected when:

- `toolSlug` is valid
- `affiliateLinkId` is present
- `target` is not bound to that affiliate link

Use a request-level assertion and expect a safe `302` redirect back to `/tools`.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: FAIL because the new affiliate-link target-binding proof is not yet covered and may reveal an allowlist gap.

**Step 3: Write minimal implementation**

Do not change production code unless the failing test demonstrates a real route-allowance problem.

**Step 4: Re-run the same e2e test**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS

### Task 2: Tighten Outbound Binding Only If the Test Demands It

**Files:**
- Modify: `app/api/outbound/route.ts`
- Test: `tests/e2e/tool-detail.spec.ts`

**Step 1: Patch only the outbound target-binding logic if necessary**

If the new test proves a mismatch is currently allowed, update only the allowlist logic needed to ensure:

- `affiliateLinkId` restricts matching targets to that link's own tracking or destination URLs
- safe fallback behavior still returns `/tools`

Do not rewrite the signature layer or analytics flow.

**Step 2: Run the focused tool-detail e2e test**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS

### Task 3: Verify Existing Outbound Protections Still Hold

**Files:**
- Reference: `tests/e2e/tool-detail.spec.ts`

**Step 1: Confirm the focused outbound scenarios remain green**

Run: `npm run test:e2e -- tests/e2e/tool-detail.spec.ts`

Expected: PASS, including:

- valid signed outbound redirect
- tampered target blocked
- non-allowlisted target blocked
- affiliate-link target mismatch blocked

**Step 2: Re-check the diff scope**

Run: `git diff -- app/api/outbound/route.ts tests/e2e/tool-detail.spec.ts`

Expected: Changes remain limited to outbound affiliate-link target binding proof and minimal enforcement.
