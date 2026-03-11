import { expect, test } from "@playwright/test";

test("sensitive routes do not render ad slots", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator('[data-ui="adsense-slot"]')).toHaveCount(0);

  await page.goto("/submit");
  await expect(page.locator('[data-ui="adsense-slot"]')).toHaveCount(0);
});

test("eligible commercial pages render ad slots", async ({ page }) => {
  await page.goto("/tools/zapier-ai");
  await expect(page.locator('[data-ui="adsense-slot"]')).toHaveCount(2);
  await expect(page.locator('[data-adsense-path-allowed="true"]')).toHaveCount(2);

  await page.goto("/use-cases/support-automation");
  await expect(page.locator('[data-ui="adsense-slot"]')).toHaveCount(1);
  await expect(page.locator('[data-adsense-path-allowed="true"]')).toHaveCount(1);
});
