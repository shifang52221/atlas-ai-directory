import { expect, test } from "@playwright/test";

test("homepage includes canonical, Organization, WebSite and SearchAction schema", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "AI Agents Decision Hub" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /http:\/\/localhost:3000\/?$/,
  );

  const schemaJson = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
    .then((chunks) => chunks.join(" "));

  expect(schemaJson).toContain('"@type":"Organization"');
  expect(schemaJson).toContain('"@type":"WebSite"');
  expect(schemaJson).toContain('"@type":"SearchAction"');
  expect(schemaJson).toContain(
    '"target":"http://localhost:3000/tools?search={search_term_string}"',
  );
});

test("tools listing page includes canonical and CollectionPage schema", async ({
  page,
}) => {
  await page.goto("/tools");

  await expect(page.getByRole("heading", { level: 1, name: "Tools" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /http:\/\/localhost:3000\/tools\/?$/,
  );

  const schemaJson = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
    .then((chunks) => chunks.join(" "));

  expect(schemaJson).toContain('"@type":"CollectionPage"');
  expect(schemaJson).toContain('"name":"AI Tools Directory"');
  expect(schemaJson).toContain('"@type":"ItemList"');
});

test("use-cases listing page includes canonical and CollectionPage schema", async ({
  page,
}) => {
  await page.goto("/use-cases");

  await expect(
    page.getByRole("heading", { level: 1, name: "Use Cases" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /http:\/\/localhost:3000\/use-cases\/?$/,
  );

  const schemaJson = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
    .then((chunks) => chunks.join(" "));

  expect(schemaJson).toContain('"@type":"CollectionPage"');
  expect(schemaJson).toContain('"name":"AI Use Cases"');
  expect(schemaJson).toContain('"@type":"BreadcrumbList"');
});

test("compare page includes canonical and CollectionPage schema", async ({
  page,
}) => {
  await page.goto("/compare");

  await expect(
    page.getByRole("heading", { level: 1, name: "Compare Tools" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /http:\/\/localhost:3000\/compare\/?$/,
  );

  const schemaJson = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
    .then((chunks) => chunks.join(" "));

  expect(schemaJson).toContain('"@type":"CollectionPage"');
  expect(schemaJson).toContain('"name":"AI Tool Comparison"');
  expect(schemaJson).toContain('"@type":"BreadcrumbList"');
});

test("workflows page includes canonical and CollectionPage schema", async ({
  page,
}) => {
  await page.goto("/workflows");

  await expect(
    page.getByRole("heading", { level: 1, name: "Workflows" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /http:\/\/localhost:3000\/workflows\/?$/,
  );

  const schemaJson = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
    .then((chunks) => chunks.join(" "));

  expect(schemaJson).toContain('"@type":"CollectionPage"');
  expect(schemaJson).toContain('"name":"AI Workflow Templates"');
  expect(schemaJson).toContain('"@type":"BreadcrumbList"');
});
