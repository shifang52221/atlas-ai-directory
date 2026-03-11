import { expect, test } from "@playwright/test";

const routes = [
  "/use-cases",
  "/compare",
  "/workflows",
  "/tools",
  "/best-ai-automation-tools",
  "/best-ai-agents-for-sales",
  "/best-ai-tools-for-support",
  "/best-ai-tools-for-marketing",
  "/submit",
  "/affiliate-disclosure",
  "/editorial-policy",
];

for (const route of routes) {
  test(`route renders main content: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
