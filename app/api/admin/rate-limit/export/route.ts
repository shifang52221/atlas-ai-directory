import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseRateLimitIpMatchMode } from "@/lib/admin-rate-limit-ip-mode";
import { parseRateLimitExportStatus } from "@/lib/admin-rate-limit-status";
import {
  getRateLimitWindowDays,
  parseRateLimitWindow,
} from "@/lib/admin-rate-limit-window";

const DAY_MS = 24 * 60 * 60 * 1000;

type RateLimitExportRow = {
  timestamp: string;
  bucket: string;
  allowed: boolean;
  remaining: number | "";
  retryAfterMs: number | "";
  ip: string;
};

function getAuditLogPath(): string {
  return path.join(process.cwd(), "dev.log");
}

function normalizeBucket(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function parseRequestedBuckets(values: string[]): string[] {
  const normalized = values.flatMap((item) =>
    item
      .split(",")
      .map((part) => normalizeBucket(part))
      .filter((value): value is string => Boolean(value)),
  );
  return Array.from(new Set(normalized));
}

function normalizeIpQuery(value: string | null): string {
  return (value || "").trim().toLowerCase();
}

function parsePositiveInt(
  value: string | null,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const min = options?.min ?? 1;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;
  return Math.min(max, Math.max(min, parsed));
}

function sanitizeFilenamePart(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
  return normalized || "na";
}

function escapeCsvValue(value: string | number | boolean): string {
  const raw = String(value);
  if (!/[",\n\r]/.test(raw)) {
    return raw;
  }

  return `"${raw.replace(/"/g, "\"\"")}"`;
}

function toTimestampMs(value: unknown): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function parseRateLimitRows(
  lines: string[],
  options: {
    fromMs: number;
    nowMs: number;
    buckets: string[];
    status: "all" | "blocked";
    ipQuery: string;
    ipMode: "contains" | "exact";
  },
): RateLimitExportRow[] {
  const rows: RateLimitExportRow[] = [];
  const selectedBucketSet = new Set(options.buckets);

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    try {
      const parsed = JSON.parse(line) as {
        timestamp?: unknown;
        scope?: unknown;
        bucket?: unknown;
        allowed?: unknown;
        remaining?: unknown;
        retryAfterMs?: unknown;
        ip?: unknown;
      };

      if (parsed.scope !== "rate_limit") {
        continue;
      }

      const timestampMs = toTimestampMs(parsed.timestamp);
      if (timestampMs === null || timestampMs < options.fromMs || timestampMs > options.nowMs) {
        continue;
      }

      const bucket = typeof parsed.bucket === "string" ? parsed.bucket.trim() : "";
      if (!bucket) {
        continue;
      }
      if (selectedBucketSet.size > 0 && !selectedBucketSet.has(bucket)) {
        continue;
      }
      const ip = typeof parsed.ip === "string" ? parsed.ip : "";
      if (options.ipQuery) {
        const normalizedIp = ip.toLowerCase();
        if (options.ipMode === "exact" && normalizedIp !== options.ipQuery) {
          continue;
        }
        if (options.ipMode === "contains" && !normalizedIp.includes(options.ipQuery)) {
          continue;
        }
      }
      const allowed = Boolean(parsed.allowed);
      if (options.status === "blocked" && allowed) {
        continue;
      }

      rows.push({
        timestamp: new Date(timestampMs).toISOString(),
        bucket,
        allowed,
        remaining:
          typeof parsed.remaining === "number" && Number.isFinite(parsed.remaining)
            ? parsed.remaining
            : "",
        retryAfterMs:
          typeof parsed.retryAfterMs === "number" && Number.isFinite(parsed.retryAfterMs)
            ? parsed.retryAfterMs
            : "",
        ip,
      });
    } catch {
      // Ignore malformed log lines.
    }
  }

  rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return rows;
}

function toCsv(rows: RateLimitExportRow[]): string {
  const header = "timestamp,bucket,allowed,remaining,retryAfterMs,ip";
  const body = rows.map((row) =>
    [
      escapeCsvValue(row.timestamp),
      escapeCsvValue(row.bucket),
      escapeCsvValue(row.allowed),
      escapeCsvValue(row.remaining),
      escapeCsvValue(row.retryAfterMs),
      escapeCsvValue(row.ip),
    ].join(","),
  );

  return [header, ...body].join("\n");
}

export async function GET(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const windowKey = parseRateLimitWindow(request.nextUrl.searchParams.get("window") || undefined);
  const status = parseRateLimitExportStatus(
    request.nextUrl.searchParams.get("status") || undefined,
  );
  const ipMode = parseRateLimitIpMatchMode(
    request.nextUrl.searchParams.get("ipMode") || undefined,
  );
  const windowDays = getRateLimitWindowDays(windowKey);
  const selectedBuckets = parseRequestedBuckets([
    ...request.nextUrl.searchParams.getAll("bucket"),
    ...request.nextUrl.searchParams.getAll("buckets"),
  ]);
  const ipQuery = normalizeIpQuery(request.nextUrl.searchParams.get("ip"));
  const scope = request.nextUrl.searchParams.get("scope") === "page" ? "page" : "all";
  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1, {
    min: 1,
    max: 100000,
  });
  const perPage = parsePositiveInt(request.nextUrl.searchParams.get("perPage"), 50, {
    min: 1,
    max: 500,
  });
  const nowMs = Date.now();
  const fromMs = nowMs - windowDays * DAY_MS;

  let lines: string[] = [];
  try {
    const content = await fs.readFile(getAuditLogPath(), "utf8");
    lines = content.split(/\r?\n/).slice(-20000);
  } catch {
    lines = [];
  }

  const rows = parseRateLimitRows(lines, {
    fromMs,
    nowMs,
    buckets: selectedBuckets,
    status,
    ipQuery,
    ipMode,
  });
  const scopedRows =
    scope === "page" ? rows.slice((page - 1) * perPage, page * perPage) : rows;
  const csv = toCsv(scopedRows);
  const filenameDate = new Date().toISOString().slice(0, 10);
  const filenameBucket =
    selectedBuckets.length > 0
      ? `-buckets-${sanitizeFilenamePart(selectedBuckets.slice(0, 5).join("-"))}`
    : "";
  const filenameIp = ipQuery ? `-ip-${sanitizeFilenamePart(ipQuery)}` : "";
  const filenameMode = `-ipmode-${ipMode}`;
  const filenameScope = scope === "page" ? `-page-${page}` : "-all";
  const filename = `rate-limit-${windowKey}-${status}${filenameBucket}${filenameIp}${filenameMode}${filenameScope}-${filenameDate}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
