# Admin Tool Detail Filter Tag Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a status filter pill next to the "Back to Tool List" link on the tool detail page when a valid filter is present.

**Architecture:** Add a small helper in `lib/admin-tools-status-filter.ts` to format the filter label and reuse existing status parsing. The detail page renders the pill only when the helper returns a label. Styling is contained in `admin.module.css`.

**Tech Stack:** Next.js App Router, React Server Components, Prisma types, CSS Modules, Vitest.

---

### Task 1: Add filter label helper with tests

**Files:**
- Modify: `f:/www/www12/tests/unit/admin-tools-status-filter.test.ts`
- Modify: `f:/www/www12/lib/admin-tools-status-filter.ts`

**Step 1: Write the failing test**

```ts
it("formats filter label only for ACTIVE/INACTIVE", () => {
  expect(formatAdminToolsFilterLabel(ToolStatus.ACTIVE)).toBe("Filter: ACTIVE");
  expect(formatAdminToolsFilterLabel(ToolStatus.INACTIVE)).toBe("Filter: INACTIVE");
  expect(formatAdminToolsFilterLabel(null)).toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/admin-tools-status-filter.test.ts`
Expected: FAIL with "formatAdminToolsFilterLabel is not a function"

**Step 3: Write minimal implementation**

```ts
export function formatAdminToolsFilterLabel(
  statusFilter: ToolStatus | null,
): string | null {
  if (!statusFilter) {
    return null;
  }
  return `Filter: ${statusFilter}`;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/admin-tools-status-filter.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add f:/www/www12/tests/unit/admin-tools-status-filter.test.ts f:/www/www12/lib/admin-tools-status-filter.ts
git commit -m "feat: add admin filter label helper"
```

---

### Task 2: Render the pill in the detail page

**Files:**
- Modify: `f:/www/www12/app/admin/(protected)/tools/[slug]/page.tsx`
- Modify: `f:/www/www12/app/admin/admin.module.css`

**Step 1: Write minimal UI change**

Add:
- `const filterLabel = formatAdminToolsFilterLabel(statusFilter);`
- Conditional render after the back link:

```tsx
{filterLabel && <span className={styles.filterTag}>{filterLabel}</span>}
```

**Step 2: Add styling**

```css
.filterTag {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--line) 82%, white 18%);
  background: color-mix(in oklab, white 90%, var(--surface) 10%);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}
```

**Step 3: Verify lint/build**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add f:/www/www12/app/admin/(protected)/tools/[slug]/page.tsx f:/www/www12/app/admin/admin.module.css
git commit -m "feat: show filter tag on admin tool detail"
```

---

### Task 3: Full verification

**Step 1: Run unit tests**

Run: `npm test`
Expected: PASS

**Step 2: Run admin e2e checks**

Run: `npm run test:e2e -- tests/e2e/admin-auth.spec.ts`
Expected: PASS

Run: `npm run test:e2e -- tests/e2e/admin-tools-status-filter.spec.ts`
Expected: PASS

**Step 3: Commit (if needed)**

```bash
git status --short
```

If clean, no commit.

