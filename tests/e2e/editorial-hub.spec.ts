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

const commercialWaveOneHubs = [
  {
    path: "/best-ai-automation-tools-for-small-business",
    h1: "Best AI Automation Tools for Small Business",
  },
  {
    path: "/make-alternatives",
    h1: "Make Alternatives",
  },
  {
    path: "/semrush-alternatives",
    h1: "Semrush Alternatives",
  },
  {
    path: "/monday-vs-clickup-for-ops",
    h1: "monday vs ClickUp for Ops Teams",
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
    await expect(
      page.getByRole("heading", { level: 2, name: "Who this shortlist fits" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Avoid this shortlist if" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Implementation playbook" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "KPI scorecard" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Buying mistakes to avoid" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "90-day rollout checklist" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Comparison questions" }),
    ).toBeVisible();
    await expect(
      page.locator('[data-ui="comparison-question-links"] a[href*="#compare-alternatives"]').first(),
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "FAQ" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Hub breadcrumbs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" }).first()).toBeVisible();
    await expect(page.locator('nav[aria-label="On this page"]')).toBeVisible();
    await expect(
      page.locator('nav[aria-label="On this page"] a[href="#top-picks"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="On this page"] a[href="#comparison-table"]').first(),
    ).toBeVisible();
    await expect(page.locator('[data-ui="related-commercial-guides"]')).toBeVisible();
    await expect(
      page.locator('[data-ui="related-commercial-guides"] a[href^="/"]').first(),
    ).toBeVisible();

    await expect(page.locator('a[href*="/api/outbound?"]').first()).toBeVisible();
    await expect(
      page.locator('a[href*="placementId=editorial_hub_hero_cta"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('table a[href*="placementId=editorial_hub_table_cta"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href*="placementId=editorial_hub_alternative_cta"]').first(),
    ).toBeVisible();
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
    expect(schemaJson).toContain('"@type":"SoftwareApplication"');
    expect(schemaJson).toContain('"operatingSystem":"Web"');
    expect(schemaJson).toContain('"applicationCategory"');
    expect(schemaJson).toContain('"mainEntityOfPage":"http://localhost:3000');
    expect(schemaJson).toContain('"inLanguage":"en-US"');

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
    expect(outboundHref).toContain("placementId=editorial_hub_hero_cta");
  });
}

for (const hub of commercialWaveOneHubs) {
  test(`commercial wave-1 page renders hub shell and canonical: ${hub.path}`, async ({
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
    await expect(page.locator('a[href*="/api/outbound?"]').first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `http://localhost:3000${hub.path}`,
    );
  });
}

test("commercial page variant B updates hero value prop and cta copy", async ({ page }) => {
  await page.goto("/make-alternatives?variant=b");

  await expect(page.locator("main")).toContainText(/Buyer-first shortlist/i);
  await expect(page.locator('a[href*="/api/outbound?"]').first()).toContainText(
    /Start trial/i,
  );
  await expect(page.locator("table a[href*='/api/outbound?']").first()).toContainText(
    /Open pricing/i,
  );
});

test("editorial hub assigns sticky variant cookie across hub pages", async ({
  page,
  context,
}) => {
  await page.goto("/best-ai-automation-tools");
  const firstVariant =
    (await page
      .locator('[data-ui="hub-impression-tracker"]')
      .getAttribute("data-variant")) || "A";

  expect(["A", "B"]).toContain(firstVariant);

  const cookies = await context.cookies();
  const variantCookie = cookies.find((item) => item.name === "atlas_hub_variant");
  expect(variantCookie?.value).toBe(firstVariant);

  await page.goto("/best-ai-agents-for-sales");
  await expect(page.locator('[data-ui="hub-impression-tracker"]')).toHaveAttribute(
    "data-variant",
    firstVariant,
  );
});

