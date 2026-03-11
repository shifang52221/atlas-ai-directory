import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  auditAffiliateExperimentExport,
  getAffiliatePerformanceData,
} from "@/lib/affiliate-performance";

type WindowKey = "7d" | "30d" | "90d";

function parseWindowKey(value: string | null): WindowKey {
  if (value === "30d") {
    return "30d";
  }
  if (value === "90d") {
    return "90d";
  }
  return "7d";
}

function toWindowDays(windowKey: WindowKey): number {
  if (windowKey === "30d") {
    return 30;
  }
  if (windowKey === "90d") {
    return 90;
  }
  return 7;
}

function parseMinImpressionsPerVariant(value: string | null): number | undefined {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined;
  }
  return Math.min(100000, parsed);
}

function parseMinAbsoluteLift(value: string | null): number | undefined {
  const parsed = Number.parseFloat(value || "");
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return Math.min(10, parsed);
}

function escapeCsvValue(value: string | number | boolean): string {
  const raw = String(value);
  if (!/[",\n\r]/.test(raw)) {
    return raw;
  }

  return `"${raw.replace(/"/g, "\"\"")}"`;
}

export async function GET(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const windowKey = parseWindowKey(request.nextUrl.searchParams.get("window"));
  const windowDays = toWindowDays(windowKey);
  const trendToolSlug = request.nextUrl.searchParams.get("tool") || undefined;
  const hubPath = request.nextUrl.searchParams.get("hub") || undefined;
  const minHubExperimentImpressionsPerVariant = parseMinImpressionsPerVariant(
    request.nextUrl.searchParams.get("minImp"),
  );
  const minHubExperimentAbsoluteLift = parseMinAbsoluteLift(
    request.nextUrl.searchParams.get("minLift"),
  );
  const generatedAt = new Date().toISOString();

  const data = await getAffiliatePerformanceData({
    windowDays,
    trendToolSlug,
    hubPath,
    minHubExperimentImpressionsPerVariant,
    minHubExperimentAbsoluteLift,
  });
  await auditAffiliateExperimentExport({
    windowKey,
    windowDays,
    toolSlug: trendToolSlug,
    hubPath,
    minImpressionsPerVariant:
      data.experimentThresholds.minImpressionsPerVariant,
    minAbsoluteLift: data.experimentThresholds.minAbsoluteLift,
    rowCount: data.hubExperimentConclusions.length,
  });

  const header = [
    "generatedAt",
    "windowDays",
    "minImpressionsPerVariant",
    "minAbsoluteLift",
    "pagePath",
    "pageTitle",
    "decision",
    "reason",
    "liftBvsA",
    "pValue",
    "confidence",
    "impressionsA",
    "impressionsB",
  ].join(",");
  const rows = data.hubExperimentConclusions.map((item) =>
    [
      escapeCsvValue(generatedAt),
      escapeCsvValue(windowDays),
      escapeCsvValue(data.experimentThresholds.minImpressionsPerVariant),
      escapeCsvValue(data.experimentThresholds.minAbsoluteLift),
      escapeCsvValue(item.pagePath),
      escapeCsvValue(item.pageTitle),
      escapeCsvValue(item.decision),
      escapeCsvValue(item.reason),
      escapeCsvValue(item.liftBvsA ?? ""),
      escapeCsvValue(item.pValue ?? ""),
      escapeCsvValue(item.confidence ?? ""),
      escapeCsvValue(item.impressionsA),
      escapeCsvValue(item.impressionsB),
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const datePart = generatedAt.slice(0, 10);
  const filename = `affiliate-experiment-conclusions-${windowKey}-${datePart}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
