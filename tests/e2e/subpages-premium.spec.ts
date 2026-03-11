import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/use-cases",
    title: "Use Cases",
    shellSelector: '[data-ui="subpage-shell"]',
    topbarSelector: '[data-ui="subpage-topbar"]',
  },
  {
    path: "/compare",
    title: "Compare Tools",
    shellSelector: '[data-ui="subpage-shell"]',
    topbarSelector: '[data-ui="subpage-topbar"]',
  },
  {
    path: "/tools",
    title: "Tools",
    shellSelector: '[data-ui="tools-topbar"]',
    topbarSelector: '[data-ui="tools-topbar"]',
  },
  {
    path: "/workflows",
    title: "Workflows",
    shellSelector: '[data-ui="subpage-shell"]',
    topbarSelector: '[data-ui="subpage-topbar"]',
  },
];

for (const route of routes) {
  test(`premium shell renders on ${route.path}`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.locator(route.shellSelector)).toBeVisible();
    await expect(page.locator(route.topbarSelector)).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: route.title }),
    ).toBeVisible();
  });
}

test("compare page links to editorial methodology policy", async ({ page }) => {
  await page.goto("/compare");
  const methodologyHeading = page.getByRole("heading", {
    level: 3,
    name: "Methodology references",
  });
  await expect(methodologyHeading).toBeVisible();
  const methodologySection = methodologyHeading.locator("..");
  await expect(
    methodologySection.getByRole("link", {
      name: "Editorial Policy",
      exact: true,
    }),
  ).toBeVisible();
});

test("use-cases page links to disclosure and methodology policies", async ({
  page,
}) => {
  await page.goto("/use-cases");
  const methodologyHeading = page.getByRole("heading", {
    level: 3,
    name: "Methodology references",
  });
  await expect(methodologyHeading).toBeVisible();
  const methodologySection = methodologyHeading.locator("..");
  await expect(
    methodologySection.getByRole("link", {
      name: "Affiliate Disclosure",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    methodologySection.getByRole("link", {
      name: "Editorial Policy",
      exact: true,
    }),
  ).toBeVisible();
});
