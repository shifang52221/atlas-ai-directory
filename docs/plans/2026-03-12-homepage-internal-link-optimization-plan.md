# Homepage Internal Link Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve homepage and footer internal linking so users and search engines can reach the site's highest-value public pages more quickly before launch.

**Architecture:** The implementation stays within the existing homepage and site footer surfaces. We will test-drive a narrow navigation polish pass by first asserting the required entry points in e2e coverage, then minimally adjusting homepage and footer link structures and labels without changing route inventory, data models, or core interactions.

**Tech Stack:** Next.js 16, TypeScript, Playwright

---

### Task 1: Lock the Required Homepage and Footer Entry Points

**Files:**
- Modify: `tests/e2e/homepage-navigation.spec.ts`
- Reference: `app/homepage-client.tsx`
- Reference: `components/site-footer.tsx`

**Step 1: Write the failing test**

Add focused assertions that the homepage exposes the launch-critical navigation paths:

- `/tools`
- `/use-cases`
- `/compare`
- `/workflows`
- representative best-of hub pages
- representative commercial-intent pages reachable from stable global navigation, most likely the footer

Use visible link text and `href` checks where practical so the test validates user-facing clarity rather than only DOM existence.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: FAIL because the current homepage/footer setup does not yet expose the final set of required launch-priority entry points with the intended clarity.

**Step 3: Write minimal implementation**

Do not change tests yet beyond the initial failing assertions. The production change belongs in the homepage/footer files.

**Step 4: Re-run test after implementation**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: PASS

### Task 2: Tighten Homepage Internal Link Clarity

**Files:**
- Modify: `app/homepage-client.tsx`
- Test: `tests/e2e/homepage-navigation.spec.ts`
- Reference: `tests/e2e/homepage-interactions.spec.ts`

**Step 1: Update the homepage link surfaces**

Make the smallest homepage changes needed to improve link intent and page reachability:

- tighten task-oriented entry links near the top of the page
- keep the current hero, search, and content-module structure
- preserve existing buying-guide and featured-tool distribution patterns
- avoid changing search, filter, and sort logic

**Step 2: Run the navigation e2e test**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: PASS

**Step 3: Run interaction regression coverage**

Run: `npm run test:e2e -- tests/e2e/homepage-interactions.spec.ts`

Expected: PASS, proving the navigation polish did not affect homepage search, filter, or sort interactions.

### Task 3: Strengthen Footer Distribution to Hub and Commercial Pages

**Files:**
- Modify: `components/site-footer.tsx`
- Test: `tests/e2e/homepage-navigation.spec.ts`

**Step 1: Refine footer link grouping**

Adjust only the footer link grouping or labels needed to better communicate:

- core directory paths
- trust and submit paths
- best-of editorial hubs
- highest-priority commercial guides

Do not add excessive link volume or create redundant destinations already emphasized elsewhere.

**Step 2: Run the same navigation e2e test**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts`

Expected: PASS with the improved footer structure visible from the homepage.

### Task 4: Run Focused Launch Verification for This Slice

**Files:**
- Reference: `tests/e2e/homepage-navigation.spec.ts`
- Reference: `tests/e2e/homepage-interactions.spec.ts`
- Reference: `tests/e2e/homepage.spec.ts`

**Step 1: Run the focused homepage pack**

Run: `npm run test:e2e -- tests/e2e/homepage-navigation.spec.ts tests/e2e/homepage-interactions.spec.ts tests/e2e/homepage.spec.ts`

Expected: PASS

**Step 2: Fix only navigation-related regressions if needed**

If a failure appears, limit fixes to:

- homepage link labeling
- homepage link placement
- footer link grouping
- navigation test expectations tied to this launch scope

**Step 3: Re-run the same focused pack**

Expected: PASS
