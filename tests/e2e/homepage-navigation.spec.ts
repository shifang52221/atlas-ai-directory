import { expect, test } from "@playwright/test";

test("homepage has navigation-site structure", async ({ page }) => {
  await page.goto("/");
  const recentUpdatesSection = page.locator("section").filter({
    has: page.getByRole("heading", { level: 2, name: "Recently updated" }),
  });

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

  await expect(
    page.getByRole("link", { name: "Browse all tools" }).first(),
  ).toHaveAttribute("href", "/tools");
  await expect(
    page.getByRole("link", { name: "Compare categories" }).first(),
  ).toHaveAttribute("href", "/compare");
  await expect(
    page.getByRole("link", { name: "Explore use cases" }).first(),
  ).toHaveAttribute("href", "/use-cases");
  await expect(
    page.getByRole("link", { name: "Open workflow templates" }).first(),
  ).toHaveAttribute("href", "/workflows");

  await expect(page.locator('a[href="/best-ai-automation-tools"]').first()).toBeVisible();
  await expect(page.locator('a[href="/best-ai-agents-for-sales"]').first()).toBeVisible();
  await expect(page.locator('a[href="/best-ai-tools-for-support"]').first()).toBeVisible();
  await expect(page.locator('a[href="/best-ai-tools-for-marketing"]').first()).toBeVisible();
  await expect(
    recentUpdatesSection.getByRole("link", { name: "Make Alternatives" }),
  ).toHaveAttribute("href", "/make-alternatives");
  await expect(
    recentUpdatesSection.getByRole("link", {
      name: "Best AI Automation Tools for Small Business",
    }),
  ).toHaveAttribute("href", "/best-ai-automation-tools-for-small-business");
  await expect(
    page.getByRole("link", { name: "Make Alternatives" }).first(),
  ).toHaveAttribute("href", "/make-alternatives");
  await expect(
    page.getByRole("link", { name: "monday vs ClickUp for Ops Teams" }).first(),
  ).toHaveAttribute("href", "/monday-vs-clickup-for-ops");

  await expect(page.locator('[data-ui="site-footer"]')).toBeVisible();
});
