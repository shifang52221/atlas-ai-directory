import { expect, test } from "@playwright/test";

const hubs = [
  {
    path: "/best-ai-automation-tools",
    h1: "Best AI Automation Tools for Ops Teams",
  },
  {
    path: "/best-ai-agents-for-sales",
    h1: "Best AI Agents for Sales Teams",
  },
  {
    path: "/best-ai-tools-for-support",
    h1: "Best AI Tools for Customer Support",
  },
  {
    path: "/best-ai-tools-for-marketing",
    h1: "Best AI Tools for Marketing Teams",
  },
];

for (const hub of hubs) {
  test(`editorial hub renders commercial sections and SEO schema: ${hub.path}`, async ({
    page,
  }) => {
    await page.goto(hub.path);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: hub.h1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Top picks" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Evidence and review basis" }),
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "FAQ" })).toBeVisible();

    await expect(page.locator('a[href*="/api/outbound?"]').first()).toBeVisible();
    await expect(page.locator('[data-ui="hub-impression-tracker"]')).toHaveCount(1);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `http://localhost:3000${hub.path}`,
    );

    const schemaJson = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
      .then((chunks) => chunks.join(" "));

    expect(schemaJson).toContain('"@type":"CollectionPage"');
    expect(schemaJson).toContain('"@type":"ItemList"');
    expect(schemaJson).toContain('"@type":"FAQPage"');

    const otherHubs = hubs
      .map((item) => item.path)
      .filter((pathItem) => pathItem !== hub.path);
    for (const targetPath of otherHubs) {
      await expect(page.locator(`a[href="${targetPath}"]`).first()).toBeVisible();
    }
  });

  test(`editorial hub variant B keeps canonical and marks outbound variant: ${hub.path}`, async ({
    page,
  }) => {
    await page.goto(`${hub.path}?variant=b`);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `http://localhost:3000${hub.path}`,
    );
    await expect(page.locator('[data-ui="hub-impression-tracker"]')).toHaveAttribute(
      "data-variant",
      "B",
    );

    const outboundHref = await page
      .locator('a[href*="/api/outbound?"]')
      .first()
      .getAttribute("href");
    expect(outboundHref).toBeTruthy();
    expect(outboundHref).toContain("variant=B");
    expect(outboundHref).toContain("placementId=editorial_hub_recommendation");
  });
}
