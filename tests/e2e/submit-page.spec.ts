import { expect, test } from "@playwright/test";

test("submit page renders and validates website URL", async ({ page }) => {
  await page.goto("/submit");

  await expect(
    page.getByRole("heading", { level: 1, name: "Submit Your Tool" }),
  ).toBeVisible();

  await page.getByLabel("Tool name *").fill("Example Tool");
  await page.getByLabel("Contact email *").fill("hello@example.com");
  await page.getByLabel("Website URL *").fill("invalid-url");
  await page.getByRole("button", { name: "Submit for Review" }).click();

  await expect(page).toHaveURL(/\/submit\?error=invalid_url/);
  await expect(
    page.getByText("Website URL must start with http:// or https://."),
  ).toBeVisible();
});

test("submit page shows rate-limit notice", async ({ page }) => {
  await page.goto("/submit?error=rate_limited");

  await expect(
    page.getByText(
      "Too many submissions from your network. Please try again later.",
    ),
  ).toBeVisible();
});
