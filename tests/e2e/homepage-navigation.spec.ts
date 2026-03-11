import { expect, test } from "@playwright/test";

test("homepage has navigation-site structure", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("searchbox", { name: "Search tools" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Featured tools" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Browse by category" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Recently updated" }),
  ).toBeVisible();

  await expect(page.locator('a[href="/best-ai-automation-tools"]').first()).toBeVisible();
  await expect(page.locator('a[href="/best-ai-agents-for-sales"]').first()).toBeVisible();
  await expect(page.locator('a[href="/best-ai-tools-for-support"]').first()).toBeVisible();
  await expect(page.locator('a[href="/best-ai-tools-for-marketing"]').first()).toBeVisible();

  await expect(page.locator('[data-ui="site-footer"]')).toBeVisible();
});
