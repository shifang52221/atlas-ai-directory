import { expect, test } from "@playwright/test";

test("approved compare query resolves to the canonical compare detail page", async ({
  page,
}) => {
  await page.goto("/compare?tool=make&vs=zapier-ai");

  await expect(page).toHaveURL(/\/compare\/zapier-ai-vs-make\/?$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Zapier AI vs Make" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Choose Zapier AI if" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Choose Make if" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Detailed comparison" }),
  ).toBeVisible();
  await expect(page.locator("summary")).toHaveCount(4);
});

test("unsupported compare query falls back to the compare hub", async ({
  page,
}) => {
  await page.goto("/compare?tool=clay&vs=lindy");

  await expect(page).toHaveURL(/\/compare\/?$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Compare Tools" }),
  ).toBeVisible();
});

test("sitemap includes curated compare detail pages only", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const xml = await response.text();

  expect(response.ok()).toBe(true);
  expect(xml).toContain("http://localhost:3000/compare/zapier-ai-vs-make");
  expect(xml).toContain("http://localhost:3000/compare/relevance-ai-vs-clay");
  expect(xml).not.toContain("http://localhost:3000/compare/clay-vs-lindy");
});
