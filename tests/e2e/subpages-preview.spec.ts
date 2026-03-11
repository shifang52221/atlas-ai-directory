import { devices, expect, test } from "@playwright/test";

test("capture compare desktop preview", async ({ page }) => {
  await page.goto("/compare");
  await expect(
    page.getByRole("heading", { level: 1, name: "Compare Tools" }),
  ).toBeVisible();
  await page.screenshot({
    path: ".artifacts/compare-desktop.png",
    fullPage: true,
  });
});

test("capture compare mobile preview", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/compare");
  await expect(
    page.getByRole("heading", { level: 1, name: "Compare Tools" }),
  ).toBeVisible();
  await page.screenshot({
    path: ".artifacts/compare-mobile.png",
    fullPage: true,
  });
  await context.close();
});
