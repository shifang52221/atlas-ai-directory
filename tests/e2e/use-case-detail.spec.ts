import { expect, test } from "@playwright/test";

test("use-case detail page renders tool recommendations and ad slot", async ({
  page,
}) => {
  await page.goto("/use-cases/support-automation");

  await expect(
    page.getByRole("heading", { level: 1, name: "Support Automation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Recommended tools" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open profile" }).first()).toHaveAttribute(
    "href",
    /\/tools\//,
  );
  await expect(
    page.getByRole("link", { name: "Visit website" }).first(),
  ).toHaveAttribute("href", /\/api\/outbound\?/);
  await expect(page.locator('[data-ui="adsense-slot"]')).toBeVisible();
  await expect(
    page.getByText("Affiliate links and ad placements on this page follow"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Affiliate Disclosure" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Editorial Policy" }).first(),
  ).toBeVisible();

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/use-cases/support-automation",
  );

  const schemaScript = page.locator('script[type="application/ld+json"]');
  await expect(schemaScript).toHaveCount(1);
  const schemaJson = await schemaScript
    .allTextContents()
    .then((chunks) => chunks.join(" "));
  expect(schemaJson).toContain('"@type":"CollectionPage"');
  expect(schemaJson).toContain('"name":"Support Automation"');
  expect(schemaJson).toContain('"@type":"BreadcrumbList"');
});
