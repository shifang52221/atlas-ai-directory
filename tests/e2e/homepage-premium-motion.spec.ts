import { expect, test } from "@playwright/test";

test("homepage includes premium motion structure", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-motion="ambient-layer"]')).toBeVisible();
  await expect(page.locator('[data-motion="hero-ring"]')).toBeVisible();
  await expect(page.locator('[data-motion="section-reveal"]')).toHaveCount(4);

  const topbarPosition = await page
    .locator('[data-ui="topbar"]')
    .evaluate((el) => getComputedStyle(el).position);
  expect(topbarPosition).toBe("sticky");
});
