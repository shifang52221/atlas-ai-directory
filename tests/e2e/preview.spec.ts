import { devices, expect, test } from "@playwright/test";

test("capture desktop homepage preview", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "AI Agents Decision Hub" }),
  ).toBeVisible();
  await page.screenshot({
    path: ".artifacts/homepage-desktop.png",
    fullPage: true,
  });
});

test("capture mobile homepage preview", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await expect(
    page.getByRole("heading", { level: 1, name: "AI Agents Decision Hub" }),
  ).toBeVisible();
  await page.screenshot({
    path: ".artifacts/homepage-mobile.png",
    fullPage: true,
  });
  await context.close();
});
