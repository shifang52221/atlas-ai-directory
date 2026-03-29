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
    shellSelector: '[data-ui="compare-page"]',
    topbarSelector: '[data-ui="compare-topbar"]',
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

test("compare page renders comparison hub sections and methodology links", async ({
  page,
}) => {
  await page.goto("/compare");
  const headToHeadHeading = page.getByRole("heading", {
    level: 2,
    name: "Popular Head-to-Head Comparisons",
  });
  const useCaseHeading = page.getByRole("heading", {
    level: 2,
    name: "Compare by Use Case",
  });
  const buyingGuideHeading = page.getByRole("heading", {
    level: 2,
    name: "Best Buying Guides Before You Compare",
  });
  const methodologyHeading = page.getByRole("heading", {
    level: 2,
    name: "How We Evaluate",
  });

  await expect(headToHeadHeading).toBeVisible();
  await expect(useCaseHeading).toBeVisible();
  await expect(buyingGuideHeading).toBeVisible();
  await expect(methodologyHeading).toBeVisible();

  const headToHeadSection = page.locator('[data-ui="compare-head-to-head"]');
  const useCaseSection = page.locator('[data-ui="compare-use-cases"]');
  const buyingGuideSection = page.locator('[data-ui="compare-buying-guides"]');
  const methodologySection = page.locator('[data-ui="compare-methodology"]');

  await expect(headToHeadSection.getByRole("link").first()).toBeVisible();
  await expect(useCaseSection.getByRole("link").first()).toBeVisible();
  await expect(buyingGuideSection.getByRole("link").first()).toBeVisible();
  await expect(
    headToHeadSection.getByRole("link", { name: "Zapier AI vs Make" }).first(),
  ).toHaveAttribute("href", "/compare/zapier-ai-vs-make");
  await expect(
    methodologySection.getByRole("link", {
      name: "Editorial Policy",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    methodologySection.getByRole("link", {
      name: "Affiliate Disclosure",
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
