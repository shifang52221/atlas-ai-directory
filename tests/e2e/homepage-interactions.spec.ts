import { expect, test } from "@playwright/test";

test("homepage supports search, filter, and sort interactions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 3, name: "Zapier AI" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search tools" }).fill("n8n");
  await expect(page.getByRole("heading", { level: 3, name: "n8n" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Zapier AI" })).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Search tools" }).fill("");
  await page.getByRole("button", { name: "No-Code" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "n8n" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Clay" })).toHaveCount(0);

  await page.getByRole("button", { name: "Newest" }).click();
  const firstCardName = await page
    .locator('[data-ui="tool-card"] h3')
    .first()
    .innerText();
  expect(firstCardName).toBe("n8n");

  await page.getByRole("button", { name: "Popular" }).click();
  const firstPopularCard = await page
    .locator('[data-ui="tool-card"] h3')
    .first()
    .innerText();
  expect(firstPopularCard).toBe("Zapier AI");
});
