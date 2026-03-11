import { expect, test } from "@playwright/test";

test("admin tools page supports status filter links", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Email").fill("admin@atlas.local");
  await page.getByLabel("Password").fill("atlas-admin");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/tools?status=INACTIVE");
  await expect(page).toHaveURL(/\/admin\/tools\?status=INACTIVE$/);

  await expect(
    page.getByRole("heading", { level: 1, name: "Tool Management" }),
  ).toBeVisible();
  const allLink = page.getByRole("link", { name: /All \(\d+\)/ });
  await expect(allLink).toBeVisible();
  await expect(allLink).toHaveAttribute("href", "/admin/tools");

  const activeLink = page.getByRole("link", { name: /Active \(\d+\)/ });
  await expect(activeLink).toBeVisible();
  await expect(activeLink).toHaveAttribute("href", "/admin/tools?status=ACTIVE");

  const inactiveLink = page.getByRole("link", { name: /Inactive \(\d+\)/ });
  await expect(inactiveLink).toHaveAttribute(
    "href",
    "/admin/tools?status=INACTIVE",
  );
  await expect(inactiveLink).toBeVisible();
  await expect(inactiveLink).toHaveAttribute("aria-current", "page");
});
