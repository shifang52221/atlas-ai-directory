import { expect, test } from "@playwright/test";

test("homepage shows product heading", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "AI Agents Decision Hub" }),
  ).toBeVisible();
});
