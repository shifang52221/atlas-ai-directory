import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const toolProfilePath = path.join(projectRoot, "lib", "tool-profile-data.ts");
const outboundRoutePath = path.join(projectRoot, "app", "api", "outbound", "route.ts");
const adminToolsActionsPath = path.join(
  projectRoot,
  "app",
  "admin",
  "(protected)",
  "tools",
  "actions.ts",
);
const docsPlanDir = path.join(projectRoot, "docs", "plans");

const timeoutMs = 20000;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toShortIsoDateTime(value) {
  return value.toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z");
}

function parseFallbackProfiles(fileText) {
  const pairs = [];
  const regex = /slug:\s*"([^"]+)"[\s\S]*?websiteUrl:\s*"([^"]+)"/g;
  for (const match of fileText.matchAll(regex)) {
    pairs.push({
      slug: match[1],
      websiteUrl: match[2],
      region: "global",
      linkKind: "DIRECT",
    });
  }

  const deduped = new Map();
  for (const pair of pairs) {
    if (!deduped.has(pair.slug)) {
      deduped.set(pair.slug, pair);
    }
  }
  return Array.from(deduped.values());
}

async function fetchWithTimeout(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": "AtlasAIDirectoryAffiliateAudit/1.0",
        ...(init?.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url) {
  const startedAt = Date.now();
  try {
    let response = await fetchWithTimeout(url, {
      method: "HEAD",
      redirect: "manual",
    });

    // Some vendors block HEAD; retry with GET.
    if (response.status === 403 || response.status === 405) {
      response = await fetchWithTimeout(url, {
        method: "GET",
        redirect: "manual",
      });
    }

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      location: response.headers.get("location") || "",
      latencyMs: Date.now() - startedAt,
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      location: "",
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}

function hasSecurityGuardChecks({ outboundRouteText, adminToolsActionsText }) {
  return {
    outboundAllowlist:
      outboundRouteText.includes("isAllowlistedOutboundTarget") &&
      outboundRouteText.includes("targetAllowlisted"),
    outboundSignature:
      outboundRouteText.includes("isValidOutboundSignature") &&
      outboundRouteText.includes("sig"),
    adminPrimaryLinkGate:
      adminToolsActionsText.includes("collectPublishMissingItems") &&
      adminToolsActionsText.includes("primary_link"),
    adminUrlValidation:
      adminToolsActionsText.includes("isValidHttpUrl") &&
      adminToolsActionsText.includes("invalid_url"),
  };
}

function toMarkdown(input) {
  const lines = [];
  lines.push("# Affiliate Link Governance Report");
  lines.push("");
  lines.push(`- Generated at: ${toShortIsoDateTime(input.generatedAt)}`);
  lines.push(`- Scope: fallback profile primary outbound links (global English launch set)`);
  lines.push(`- Total links checked: ${input.rows.length}`);
  lines.push(`- Passing links: ${input.summary.passing}`);
  lines.push(`- Failing links: ${input.summary.failing}`);
  lines.push("");
  lines.push("## Inventory + Validation");
  lines.push("");
  lines.push("| Tool Slug | Region | Link Kind | Website URL | Status | Result | Latency(ms) | Note |");
  lines.push("|---|---|---|---|---:|---|---:|---|");
  for (const row of input.rows) {
    const note = row.error
      ? `error: ${row.error}`
      : row.location
        ? `location: ${row.location}`
        : "ok";
    lines.push(
      `| ${row.slug} | ${row.region} | ${row.linkKind} | ${row.websiteUrl} | ${row.status} | ${row.ok ? "PASS" : "FAIL"} | ${row.latencyMs} | ${note} |`,
    );
  }
  lines.push("");
  lines.push("## Governance Controls");
  lines.push("");
  lines.push(`- Outbound allowlist enforcement: ${input.controls.outboundAllowlist ? "PASS" : "FAIL"}`);
  lines.push(`- Outbound signature enforcement: ${input.controls.outboundSignature ? "PASS" : "FAIL"}`);
  lines.push(`- Admin publish gate for primary link completeness: ${input.controls.adminPrimaryLinkGate ? "PASS" : "FAIL"}`);
  lines.push(`- Admin URL validation before save/publish: ${input.controls.adminUrlValidation ? "PASS" : "FAIL"}`);
  lines.push("");
  lines.push("## Follow-up Actions");
  lines.push("");
  if (input.summary.failing === 0) {
    lines.push("- No broken links detected in launch fallback set.");
  } else {
    lines.push("- Fix or replace all failing links before launch freeze.");
  }
  lines.push("- Re-run `npm run audit:affiliate` before each release candidate.");
  lines.push("- Keep affiliate disclosure and editorial policy links visible on every monetized template.");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const generatedAt = new Date();
  const [toolProfileText, outboundRouteText, adminToolsActionsText] = await Promise.all([
    readFile(toolProfilePath, "utf8"),
    readFile(outboundRoutePath, "utf8"),
    readFile(adminToolsActionsPath, "utf8"),
  ]);

  const inventory = parseFallbackProfiles(toolProfileText);
  const checks = await Promise.all(
    inventory.map(async (item) => ({
      ...item,
      ...(await checkUrl(item.websiteUrl)),
    })),
  );

  const summary = {
    passing: checks.filter((item) => item.ok).length,
    failing: checks.filter((item) => !item.ok).length,
  };
  const controls = hasSecurityGuardChecks({ outboundRouteText, adminToolsActionsText });
  const markdown = toMarkdown({
    generatedAt,
    rows: checks,
    summary,
    controls,
  });

  await mkdir(docsPlanDir, { recursive: true });
  const outputPath = path.join(
    docsPlanDir,
    `${todayIso()}-affiliate-link-governance-report.md`,
  );
  await writeFile(outputPath, markdown, "utf8");

  process.stdout.write(
    `Affiliate audit complete: ${summary.passing}/${checks.length} passing, ${summary.failing} failing.\nReport: ${outputPath}\n`,
  );

  if (summary.failing > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`Affiliate audit failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
