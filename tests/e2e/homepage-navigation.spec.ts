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
  await expect(page.locator('[data-ui="site-footer"]')).toBeVisible();
});
