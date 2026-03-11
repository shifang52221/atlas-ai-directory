import { expect, test } from "@playwright/test";
import fs from "fs/promises";

test("admin route requires login and allows access with valid password", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Email").fill("admin@atlas.local");
  await page.getByLabel("Password").fill("atlas-admin");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Admin Dashboard" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Tools" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Affiliate", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Rate Limit Events (24h)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Rate Limit Blocked Trend (7d)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "All buckets" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Last 24h" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Last 7d" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Last 30d" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Export CSV" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "All events" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Blocked only" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Last 30d" }).click();
  await expect(page).toHaveURL(/\/admin\?window=30d$/);
  await page.getByRole("link", { name: "Blocked only" }).click();
  await expect(page).toHaveURL(/\/admin\?window=30d&status=blocked$/);

  const exportResponse = await page.request.get(
    "/api/admin/rate-limit/export?window=30d&status=blocked",
  );
  expect(exportResponse.status()).toBe(200);
  expect(exportResponse.headers()["content-type"]).toContain("text/csv");
  const csvBody = await exportResponse.text();
  expect(csvBody).toContain("timestamp,bucket,allowed");

  await expect(page.getByRole("link", { name: "Rate Limits" })).toBeVisible();
  await page.getByRole("link", { name: "Rate Limits" }).click();
  await expect(page).toHaveURL(/\/admin\/rate-limit$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Rate Limit Audit Log" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Last 24h" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Last 7d" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Last 30d" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Timestamp" })).toBeVisible();
  await expect(page.getByLabel("IP contains")).toBeVisible();
  await expect(page.getByLabel("IP match mode")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export current page" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export all filtered" })).toBeVisible();

  await page.getByLabel("IP match mode").selectOption("exact");
  await page.getByLabel("IP contains").fill("127");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/admin\/rate-limit\?ip=127&ipMode=exact$/);

  const pageExportResponse = await page.request.get(
    "/api/admin/rate-limit/export?ip=127&ipMode=exact&buckets=submit_form,admin_login&scope=page&page=1&perPage=50",
  );
  expect(pageExportResponse.status()).toBe(200);
  expect(pageExportResponse.headers()["content-type"]).toContain("text/csv");

  await page.getByRole("link", { name: "Affiliate", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/affiliate$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Affiliate Performance" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Funnel (7d)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Outbound vs Conversions Trend (7d)",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "All tools" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Top Converters (7d)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Low CVR Candidates (7d)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Hub Impressions vs Outbound Trend (7d)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Low CTR Alerts (7d)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Recommended Actions (7d)" }),
  ).toBeVisible();
  await expect(page.getByLabel("Min impressions / variant")).toBeVisible();
  await expect(page.getByLabel("Min absolute lift")).toBeVisible();
  await page.getByLabel("Min impressions / variant").fill("50");
  await page.getByLabel("Min absolute lift").fill("0.2");
  await expect(page.getByLabel("Min impressions / variant")).toHaveValue("50");
  await expect(page.getByLabel("Min absolute lift")).toHaveValue("0.2");
  await page.getByRole("button", { name: "Apply Thresholds" }).click();
  await expect(page).toHaveURL(/minImp=/);
  await expect(page).toHaveURL(/minLift=/);
  const thresholdUrl = new URL(page.url());
  const minImp = thresholdUrl.searchParams.get("minImp");
  const minLift = thresholdUrl.searchParams.get("minLift");
  expect(minImp).toBeTruthy();
  expect(minLift).toBeTruthy();
  await expect(page.getByRole("link", { name: "Export Experiment CSV" })).toHaveAttribute(
    "href",
    new RegExp(`minImp=${minImp}`),
  );
  await expect(page.getByRole("link", { name: "Export Experiment CSV" })).toHaveAttribute(
    "href",
    new RegExp(`minLift=${minLift}`),
  );
  await expect(
    page.getByRole("link", { name: "Export Experiment CSV" }),
  ).toBeVisible();
  const uniqueMinImp = 51;
  const uniqueMinLift = 0.21;
  const experimentExportResponse = await page.request.get(
    `/api/admin/affiliate/experiments/export?window=7d&hub=/best-ai-automation-tools&minImp=${uniqueMinImp}&minLift=${uniqueMinLift}`,
  );
  expect(experimentExportResponse.status()).toBe(200);
  expect(experimentExportResponse.headers()["content-type"]).toContain("text/csv");
  const auditLog = await fs.readFile(`${process.cwd()}/dev.log`, "utf8");
  expect(auditLog).toContain('"scope":"affiliate_experiment_export"');
  expect(auditLog).toContain('"windowKey":"7d"');
  expect(auditLog).toContain('"hubPath":"/best-ai-automation-tools"');
  expect(auditLog).toContain(`"minImpressionsPerVariant":${uniqueMinImp}`);
  expect(auditLog).toContain(`"minAbsoluteLift":${uniqueMinLift}`);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 3, name: "Recent Experiment Exports" }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "/best-ai-automation-tools" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "All hubs" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Manual Backfill History" }),
  ).toBeVisible();
  await expect(page.getByLabel("Metric", { exact: true })).toBeVisible();
  await expect(page.locator("#affiliate-tool")).toBeVisible();
  await expect(page.getByLabel("Count")).toBeVisible();

  await page.getByLabel("Metric", { exact: true }).selectOption("CONVERSION");
  await page.getByLabel("Count").fill("2");
  await page.getByRole("button", { name: "Save Backfill" }).click();
  await expect(page).toHaveURL(new RegExp(`minImp=${minImp}`));
  await expect(page).toHaveURL(new RegExp(`minLift=${minLift}`));
  await expect(page.getByText("Manual metric saved.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Correct" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Correct" }).first().click();
  await expect(page).toHaveURL(new RegExp(`minImp=${minImp}`));
  await expect(page).toHaveURL(new RegExp(`minLift=${minLift}`));
  await expect(page.getByText("Manual metric corrected.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page).toHaveURL(new RegExp(`minImp=${minImp}`));
  await expect(page).toHaveURL(new RegExp(`minLift=${minLift}`));
  await expect(page.getByText("Manual metric deleted.")).toBeVisible();
});

test("admin login page shows rate-limit notice", async ({ page }) => {
  await page.goto("/admin/login?error=rate_limited");

  await expect(
    page.getByText("Too many login attempts. Please wait and try again."),
  ).toBeVisible();
});

test("admin export api rejects unauthenticated requests", async ({ request }) => {
  const response = await request.get("/api/admin/rate-limit/export");
  expect(response.status()).toBe(401);

  const experimentResponse = await request.get(
    "/api/admin/affiliate/experiments/export",
  );
  expect(experimentResponse.status()).toBe(401);
});

test("affiliate hub action status persists after save and reload", async ({ page }) => {
  const hubPath = "/best-ai-agents-for-sales";
  const seededNote = `seed-${Date.now()}`;
  const persistedNote = `E2E persisted status ${Date.now()}`;
  const seedLine = JSON.stringify({
    timestamp: new Date().toISOString(),
    scope: "affiliate_hub_action",
    pagePath: hubPath,
    status: "TODO",
    note: seededNote,
  });
  await fs.appendFile(`${process.cwd()}/dev.log`, `${seedLine}\n`, "utf8");

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email").fill("admin@atlas.local");
  await page.getByLabel("Password").fill("atlas-admin");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/affiliate");
  await expect(
    page.getByRole("heading", { level: 3, name: "Recommended Actions (7d)" }),
  ).toBeVisible();

  const actionsTable = page.locator("table", {
    has: page.getByRole("columnheader", { name: "Status" }),
  });
  const row = actionsTable
    .locator("tr", { has: page.locator(`input[name="pagePath"][value="${hubPath}"]`) })
    .first();
  await expect(row).toBeVisible();

  await row.getByRole("combobox").selectOption("TESTING");
  await row.getByRole("textbox", { name: `Action note ${hubPath}` }).fill(persistedNote);
  await row.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Hub action status saved.")).toBeVisible();
  await expect(row.getByText("Current: TESTING")).toBeVisible();

  await page.reload();
  const rowAfterReload = page
    .locator("table", {
      has: page.getByRole("columnheader", { name: "Status" }),
    })
    .locator("tr", { has: page.locator(`input[name="pagePath"][value="${hubPath}"]`) })
    .first();
  await expect(rowAfterReload).toBeVisible();
  await expect(rowAfterReload.getByText("Current: TESTING")).toBeVisible();
  await expect(
    rowAfterReload.getByRole("textbox", { name: `Action note ${hubPath}` }),
  ).toHaveValue(persistedNote);
});

test("affiliate hub batch status update persists for selected rows", async ({ page }) => {
  const hubA = "/best-ai-tools-for-support";
  const hubB = "/best-ai-tools-for-marketing";
  const note = `batch-${Date.now()}`;
  const seedTimestamp = new Date().toISOString();
  const lines = [
    JSON.stringify({
      timestamp: seedTimestamp,
      scope: "affiliate_hub_action",
      pagePath: hubA,
      status: "TODO",
      note: "seed-a",
    }),
    JSON.stringify({
      timestamp: seedTimestamp,
      scope: "affiliate_hub_action",
      pagePath: hubB,
      status: "TESTING",
      note: "seed-b",
    }),
  ].join("\n");
  await fs.appendFile(`${process.cwd()}/dev.log`, `${lines}\n`, "utf8");

  await page.goto("/admin");
  await page.getByLabel("Email").fill("admin@atlas.local");
  await page.getByLabel("Password").fill("atlas-admin");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/affiliate");
  await expect(
    page.getByRole("heading", { level: 3, name: "Recommended Actions (7d)" }),
  ).toBeVisible();

  await page.locator(`input[name="pagePaths"][value="${hubA}"]`).check();
  await page.locator(`input[name="pagePaths"][value="${hubB}"]`).check();
  await page.getByLabel("Batch status").selectOption("VERIFIED");
  await page.getByLabel("Batch note").fill(note);
  await page.getByRole("button", { name: "Apply Batch Status" }).click();

  await expect(page).toHaveURL(/actionStatus=VERIFIED/);
  await expect(page.getByText(/Batch hub action status saved/i)).toBeVisible();

  const actionsTable = page.locator("table", {
    has: page.getByRole("columnheader", { name: "Status" }),
  });
  const rowA = actionsTable
    .locator("tr", { has: page.locator(`input[name="pagePath"][value="${hubA}"]`) })
    .first();
  const rowB = actionsTable
    .locator("tr", { has: page.locator(`input[name="pagePath"][value="${hubB}"]`) })
    .first();
  await expect(rowA.getByText("Current: VERIFIED")).toBeVisible();
  await expect(rowB.getByText("Current: VERIFIED")).toBeVisible();

  await page.reload();
  const rowAAfterReload = page
    .locator("table", {
      has: page.getByRole("columnheader", { name: "Status" }),
    })
    .locator("tr", { has: page.locator(`input[name="pagePath"][value="${hubA}"]`) })
    .first();
  const rowBAfterReload = page
    .locator("table", {
      has: page.getByRole("columnheader", { name: "Status" }),
    })
    .locator("tr", { has: page.locator(`input[name="pagePath"][value="${hubB}"]`) })
    .first();
  await expect(rowAAfterReload.getByText("Current: VERIFIED")).toBeVisible();
  await expect(rowBAfterReload.getByText("Current: VERIFIED")).toBeVisible();
});
