import { expect, test } from "@playwright/test";

test("tool detail page renders profile and monetization slots", async ({
  page,
}) => {
  await page.goto("/tools/zapier-ai");

  await expect(
    page.getByRole("heading", { level: 1, name: "Zapier AI" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Visit Website" }),
  ).toHaveAttribute("href", /\/api\/outbound\?/);
  await expect(page.locator('[data-ui="adsense-slot"]')).toHaveCount(2);
  await expect(
    page.getByRole("heading", { level: 2, name: "Editorial Review" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "FAQ" }),
  ).toBeVisible();
  await expect(
    page.getByText("Is Zapier AI worth it for RevOps and SMB operations teams?"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Top Alternatives" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Make", exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Compare Zapier AI vs/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Best use cases for Zapier AI/i }),
  ).toBeVisible();

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/tools/zapier-ai",
  );

  const schemaScript = page.locator('script[type="application/ld+json"]');
  await expect(schemaScript).toHaveCount(1);
  const schemaJson = await schemaScript
    .allTextContents()
    .then((chunks) => chunks.join(" "));
  expect(schemaJson).toContain('"@type":"SoftwareApplication"');
  expect(schemaJson).toContain('"name":"Zapier AI"');
  expect(schemaJson).toContain('"@type":"Review"');
  expect(schemaJson).toContain('"@type":"FAQPage"');
  expect(schemaJson).toContain('"@type":"BreadcrumbList"');
});

test("outbound endpoint returns redirect for signed outbound URLs", async ({
  page,
  request,
}) => {
  await page.goto("/tools/zapier-ai");
  const outboundHref = await page
    .getByRole("link", { name: "Visit Website" })
    .getAttribute("href");

  expect(outboundHref).toBeTruthy();

  const response = await request.get(outboundHref!, {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toContain("https://zapier.com/");
});

test("outbound endpoint blocks tampered target params", async ({
  page,
  request,
}) => {
  await page.goto("/tools/zapier-ai");
  const outboundHref = await page
    .getByRole("link", { name: "Visit Website" })
    .getAttribute("href");

  expect(outboundHref).toBeTruthy();

  const tamperedUrl = new URL(outboundHref!, "http://localhost:3000");
  tamperedUrl.searchParams.set("target", "https://example.com/phishing");

  const response = await request.get(
    `${tamperedUrl.pathname}?${tamperedUrl.searchParams.toString()}`,
    {
      maxRedirects: 0,
    },
  );

  expect(response.status()).toBe(302);
  expect(response.headers().location).toContain("/tools");
});

test("clay tool detail uses curated seo editorial content", async ({ page }) => {
  await page.goto("/tools/clay");

  await expect(page.getByRole("heading", { level: 1, name: "Clay" })).toBeVisible();
  await expect(
    page.getByText("Is Clay a strong choice for modern outbound and enrichment workflows?"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Compare Clay vs/i }).first(),
  ).toBeVisible();
});

test("make tool detail exposes keyword-cluster faq coverage", async ({ page }) => {
  await page.goto("/tools/make");

  await expect(page.getByRole("heading", { level: 1, name: "Make" })).toBeVisible();
  await expect(
    page.getByText("Make vs Zapier AI: what should operators compare first?"),
  ).toBeVisible();
  await expect(
    page.getByText("best Make alternatives", { exact: false }),
  ).toBeVisible();
});

test("relevance-ai and lindy detail pages expose keyword-cluster faq coverage", async ({
  page,
}) => {
  await page.goto("/tools/relevance-ai");
  await expect(
    page.getByText("Relevance AI vs Lindy: which is better for multi-agent orchestration?"),
  ).toBeVisible();
  await expect(
    page.getByText("best Relevance AI alternatives", { exact: false }),
  ).toBeVisible();

  await page.goto("/tools/lindy");
  await expect(
    page.getByText("Lindy vs Relevance AI: which one should SMB teams pick first?"),
  ).toBeVisible();
  await expect(
    page.getByText("best Lindy alternatives", { exact: false }),
  ).toBeVisible();
});
