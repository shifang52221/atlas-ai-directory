import { expect, test } from "@playwright/test";

test("tools directory supports search, filter, sort, and pagination", async ({
  page,
}) => {
  await page.goto("/tools");

  await expect(page.getByRole("heading", { level: 1, name: "Tools" })).toBeVisible();
  await expect(page.locator('[data-ui="tool-directory-card"]')).toHaveCount(4);

  await page.getByRole("searchbox", { name: "Search tools" }).fill("n8n");
  await expect(page.getByRole("heading", { level: 3, name: "n8n" })).toBeVisible();
  await expect(page.locator('[data-ui="tool-directory-card"]')).toHaveCount(1);

  await page.getByRole("searchbox", { name: "Search tools" }).fill("");
  await page.getByRole("button", { name: "No-Code" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "n8n" })).toBeVisible();

  await page.getByRole("button", { name: "Newest" }).click();
  const firstCardName = await page
    .locator('[data-ui="tool-directory-card"] h3')
    .first()
    .innerText();
  expect(firstCardName).toBe("n8n");

  await page.getByRole("button", { name: "All" }).click();
  await expect(page.locator('[data-ui="tools-page-indicator"]')).toContainText(
    "Page 1 / 2",
  );
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator('[data-ui="tools-page-indicator"]')).toContainText(
    "Page 2 / 2",
  );
});
