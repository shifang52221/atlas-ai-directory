# Homepage Commercial Link Surfacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface representative commercial-intent pages from the homepage body so users can reach launch-priority alternative and comparison content earlier in their decision flow.

**Architecture:** The implementation stays entirely inside existing homepage modules. We will use TDD to first assert that representative commercial pages are visible from the homepage body, then minimally update section-level links or card targets in `app/homepage-client.tsx` without altering route inventory, data models, or homepage interactions.

**Tech Stack:** Next.js 16, TypeScript, Playwright

---

### Task 1: Define the Required Homepage-Body Commercial Destinations

**Files:**
- Modify: `tests/e2e/homepage-navigation.spec.ts`
- Reference: `app/homepage-client.tsx`

**Step 1: Write the failing test**

Add focused assertions proving that the homepage body exposes representative commercial-intent pages, not just the footer. The assertions should validate:

- one alternative page such as `/make-alternatives`
- one comparison or best-for page such as `/monday-vs-clickup-for-ops` or `/best-ai-automation-tools-for-small-business`

Target body-level links or section-level CTAs rather than footer-only links.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: FAIL because the current homepage body does not yet expose the chosen representative commercial destinations.

**Step 3: Write minimal implementation**

Do not change product code yet beyond what is required after the failing test is confirmed.

**Step 4: Re-run the same test after implementation**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: PASS

### Task 2: Strengthen Commercial Entry Points Inside Existing Homepage Modules

**Files:**
- Modify: `app/homepage-client.tsx`
- Test: `tests/e2e/homepage-navigation.spec.ts`

**Step 1: Update existing homepage modules**

Make the smallest body-level homepage changes needed to surface commercial destinations:

- adjust section-level CTAs or card links inside existing modules
- keep `Featured tools`, `Top this week`, `Recently updated`, and `Best AI buying guides` recognizable in their current roles
- avoid creating a new heavyweight module
- avoid expanding the number of exposed commercial pages beyond a tight representative set

**Step 2: Run the homepage navigation test**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: PASS

### Task 3: Verify Interaction Safety

**Files:**
- Reference: `app/homepage-client.tsx`
- Test: `tests/e2e/homepage-interactions.spec.ts`

**Step 1: Run homepage interaction regression coverage**

Run: `npm run test:e2e -- tests/e2e/homepage-interactions.spec.ts`

Expected: PASS, confirming that search, filter, and sort still behave exactly as before.

**Step 2: Fix only homepage-body commercial-link regressions if needed**

Limit any follow-up fixes to:

- homepage section CTAs
- homepage body card links
- navigation expectations tied to this launch slice

**Step 3: Re-run the same interaction test**

Run: `npm run test:e2e -- tests/e2e/homepage-interactions.spec.ts`

Expected: PASS

### Task 4: Run Focused Verification for the Homepage Slice

**Files:**
- Reference: `tests/e2e/homepage-navigation.spec.ts`
- Reference: `tests/e2e/homepage-interactions.spec.ts`
- Reference: `tests/e2e/homepage.spec.ts`

**Step 1: Run the focused homepage pack**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts tests/e2e/homepage-interactions.spec.ts tests/e2e/homepage.spec.ts`

Expected: PASS

**Step 2: Fix only issues inside the agreed scope**

If failures appear, limit fixes to:

- homepage body-level commercial link surfacing
- CTA wording inside existing modules
- test expectations aligned to this launch slice

**Step 3: Re-run the same focused pack**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts tests/e2e/homepage-interactions.spec.ts tests/e2e/homepage.spec.ts`

Expected: PASS
