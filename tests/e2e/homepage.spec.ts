import { expect, test } from "@playwright/test";

test("homepage shows the launch brand hierarchy", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Atlas AI Directory" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Atlas AI Directory" }),
  ).toBeVisible();
  await expect(page.getByText("AI Agents Decision Hub")).toBeVisible();
});
