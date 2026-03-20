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
  "/best-ai-automation-tools-for-small-business",
  "/best-ai-sales-agents-for-smb",
  "/best-ai-tools-for-marketing-under-100",
  "/best-ai-tools-for-support-ticket-triage",
  "/make-alternatives",
  "/semrush-alternatives",
  "/hubspot-alternatives-for-startups",
  "/monday-vs-clickup-for-ops",
  "/synthesia-alternatives",
  "/descript-alternatives",
  "/ai-sales-automation-tools-for-lead-enrichment",
  "/ai-workflow-tools-for-internal-operations",
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
