import { expect, test } from "@playwright/test";

const policyRoutes = [
  {
    path: "/affiliate-disclosure",
    title: "Affiliate Disclosure",
  },
  {
    path: "/editorial-policy",
    title: "Editorial Policy",
  },
];

for (const route of policyRoutes) {
  test(`${route.path} includes WebPage JSON-LD`, async ({ page }) => {
    await page.goto(route.path);

    await expect(
      page.getByRole("heading", { level: 1, name: route.title }),
    ).toBeVisible();

    const schemaScript = page.locator('script[type="application/ld+json"]');
    await expect(schemaScript.first()).toHaveCount(1);
    const schemaJson = await schemaScript.first().evaluate((el) => el.textContent || "");
    expect(schemaJson).toContain('"@type":"WebPage"');
  });
}
