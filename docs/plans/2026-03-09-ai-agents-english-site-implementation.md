# AI Agents English Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Launch an English AI Agents vertical decision site optimized for affiliate revenue first, with policy-ready foundation for AdSense later.

**Architecture:** Build a static-first Next.js + TypeScript site using content collections for tools, use cases, comparisons, and workflows. Generate SEO pages from structured markdown/JSON content and add event tracking for outbound affiliate clicks. Keep templates reusable to scale content production without rewriting layout logic.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Contentlayer (or MDX content pipeline), Vitest, Playwright, Vercel Analytics (or Plausible), ESLint/Prettier.

---

### Task 1: Initialize Project Skeleton

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`

**Step 1: Write the failing test**

```ts
// tests/smoke/homepage.spec.ts
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/smoke/homepage.spec.ts -g "homepage loads"`  
Expected: FAIL with connection/refusal or missing app.

**Step 3: Write minimal implementation**

- Scaffold Next.js app files.
- Add `<h1>` to `app/page.tsx`.

**Step 4: Run test to verify it passes**

Run: `npm run dev` then `npx playwright test tests/smoke/homepage.spec.ts -g "homepage loads"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold nextjs site with basic homepage"
```

### Task 2: Define Content Schemas

**Files:**
- Create: `content/tools/*.mdx`
- Create: `content/use-cases/*.mdx`
- Create: `content/compare/*.mdx`
- Create: `content/workflows/*.mdx`
- Create: `lib/content/types.ts`
- Test: `tests/unit/content-schema.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { validateTool } from "@/lib/content/types";

describe("tool schema", () => {
  it("requires name, slug, pricing, affiliate", () => {
    const result = validateTool({});
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/content-schema.test.ts`  
Expected: FAIL with missing validator or import errors.

**Step 3: Write minimal implementation**

- Implement TypeScript/Zod schema validators for all content types.

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/content-schema.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add content lib tests
git commit -m "feat: add content schemas for tools and decision pages"
```

### Task 3: Build Site Information Architecture

**Files:**
- Create: `app/use-cases/page.tsx`
- Create: `app/use-cases/[slug]/page.tsx`
- Create: `app/compare/page.tsx`
- Create: `app/compare/[slug]/page.tsx`
- Create: `app/tools/page.tsx`
- Create: `app/tools/[slug]/page.tsx`
- Create: `app/workflows/page.tsx`
- Create: `app/workflows/[slug]/page.tsx`
- Test: `tests/smoke/routes.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

const routes = ["/use-cases", "/compare", "/tools", "/workflows"];
for (const route of routes) {
  test(`route works: ${route}`, async ({ page }) => {
    await page.goto(`http://localhost:3000${route}`);
    await expect(page.locator("main")).toBeVisible();
  });
}
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/smoke/routes.spec.ts`  
Expected: FAIL on missing routes.

**Step 3: Write minimal implementation**

- Add route pages and render simple content lists from stub data.

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/smoke/routes.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app tests
git commit -m "feat: implement core route structure for vertical site"
```

### Task 4: Create Reusable Decision Components

**Files:**
- Create: `components/decision-table.tsx`
- Create: `components/tool-card.tsx`
- Create: `components/affiliate-link.tsx`
- Test: `tests/unit/affiliate-link.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { AffiliateLink } from "@/components/affiliate-link";

test("adds sponsored rel attributes", () => {
  render(<AffiliateLink href="https://example.com">Go</AffiliateLink>);
  const link = screen.getByRole("link", { name: "Go" });
  expect(link).toHaveAttribute("rel", expect.stringContaining("sponsored"));
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/affiliate-link.test.tsx`  
Expected: FAIL due to missing component.

**Step 3: Write minimal implementation**

- Build `AffiliateLink` enforcing `rel="nofollow sponsored noopener"` and event hooks.
- Build decision UI components.

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/affiliate-link.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add components tests
git commit -m "feat: add reusable decision and affiliate-safe components"
```

### Task 5: Implement SEO Metadata and Structured Data

**Files:**
- Create: `lib/seo.ts`
- Modify: `app/tools/[slug]/page.tsx`
- Modify: `app/compare/[slug]/page.tsx`
- Modify: `app/use-cases/[slug]/page.tsx`
- Test: `tests/unit/structured-data.test.ts`

**Step 1: Write the failing test**

```ts
import { buildSoftwareJsonLd } from "@/lib/seo";
import { expect, test } from "vitest";

test("software schema includes required keys", () => {
  const data = buildSoftwareJsonLd({ name: "Demo", url: "https://x.com" });
  expect(data["@type"]).toBe("SoftwareApplication");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/structured-data.test.ts`  
Expected: FAIL with missing builder.

**Step 3: Write minimal implementation**

- Build JSON-LD helper for `SoftwareApplication`, `Review`, `ItemList`.
- Inject schema scripts into decision pages.

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/structured-data.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app lib tests
git commit -m "feat: add metadata and structured data for search visibility"
```

### Task 6: Add Analytics and Affiliate Event Tracking

**Files:**
- Create: `lib/analytics.ts`
- Modify: `components/affiliate-link.tsx`
- Test: `tests/unit/analytics-click.test.ts`

**Step 1: Write the failing test**

```ts
import { trackAffiliateClick } from "@/lib/analytics";
import { expect, test, vi } from "vitest";

test("tracks click payload", () => {
  const fn = vi.fn();
  trackAffiliateClick(fn, { tool: "zapier", page: "/compare/x" });
  expect(fn).toHaveBeenCalledOnce();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/analytics-click.test.ts`  
Expected: FAIL due to missing tracker.

**Step 3: Write minimal implementation**

- Implement normalized event payload and link click trigger.

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/analytics-click.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add components lib tests
git commit -m "feat: track affiliate outbound clicks"
```

### Task 7: Publish Compliance and Trust Pages

**Files:**
- Create: `app/disclosure/page.tsx`
- Create: `app/privacy-policy/page.tsx`
- Create: `app/terms/page.tsx`
- Modify: `app/layout.tsx`
- Test: `tests/smoke/compliance-pages.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("compliance pages are reachable", async ({ page }) => {
  for (const route of ["/disclosure", "/privacy-policy", "/terms"]) {
    await page.goto(`http://localhost:3000${route}`);
    await expect(page.locator("main")).toBeVisible();
  }
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/smoke/compliance-pages.spec.ts`  
Expected: FAIL on missing routes.

**Step 3: Write minimal implementation**

- Add legal pages and footer links.

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/smoke/compliance-pages.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app tests
git commit -m "feat: add disclosure privacy and terms pages"
```

### Task 8: Seed MVP Content

**Files:**
- Create: `content/use-cases/*.mdx` (8 files)
- Create: `content/compare/*.mdx` (12 files)
- Create: `content/tools/*.mdx` (20 files)
- Create: `content/workflows/*.mdx` (5 files)
- Test: `tests/unit/content-counts.test.ts`

**Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { contentCounts } from "@/lib/content/counts";

test("meets MVP content minimum", () => {
  expect(contentCounts.useCases).toBeGreaterThanOrEqual(8);
  expect(contentCounts.compare).toBeGreaterThanOrEqual(12);
  expect(contentCounts.tools).toBeGreaterThanOrEqual(20);
  expect(contentCounts.workflows).toBeGreaterThanOrEqual(5);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/content-counts.test.ts`  
Expected: FAIL with counts below threshold.

**Step 3: Write minimal implementation**

- Add seed content entries with consistent frontmatter fields.

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/content-counts.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add content tests
git commit -m "feat: add mvp content set for launch"
```

### Task 9: Final Verification and Launch Readiness

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-03-09-ai-agents-english-site-design.md`
- Test: `tests/*`

**Step 1: Write the failing test**

No new test. Verification task.

**Step 2: Run full checks**

Run: `npm run lint`  
Expected: PASS with zero errors.

Run: `npx vitest`  
Expected: PASS.

Run: `npx playwright test`  
Expected: PASS.

Run: `npm run build`  
Expected: PASS and static generation complete.

**Step 3: Write minimal implementation**

- Fix any failures from lint/test/build.
- Update `README.md` with local runbook.

**Step 4: Re-run full checks**

Run all commands above again.  
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: launch-ready affiliate-first ai agents vertical site"
```

## Notes

- Keep editorial disclosure visible on every monetized page.
- Do not add AdSense scripts until affiliate baseline pages are live and policy pages are complete.
- Prioritize data freshness: add a monthly review cadence for top money pages.

Plan complete and saved to `docs/plans/2026-03-09-ai-agents-english-site-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
