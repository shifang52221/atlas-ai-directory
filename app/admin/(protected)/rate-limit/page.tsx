import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import {
  getRateLimitIpMatchModeOptions,
  isDefaultRateLimitIpMatchMode,
  parseRateLimitIpMatchMode,
  type RateLimitIpMatchMode,
} from "@/lib/admin-rate-limit-ip-mode";
import {
  getRateLimitExportStatusOptions,
  isDefaultRateLimitExportStatus,
  parseRateLimitExportStatus,
  type RateLimitExportStatus,
} from "@/lib/admin-rate-limit-status";
import {
  getRateLimitWindowDays,
  getRateLimitWindowOptions,
  isDefaultRateLimitWindow,
  parseRateLimitWindow,
  type RateLimitWindowKey,
} from "@/lib/admin-rate-limit-window";
import styles from "../../admin.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 50;
const MAX_LOG_LINES = 20000;

type RankedItem = {
  label: string;
  count: number;
};

type RateLimitAuditRow = {
  timestamp: string;
  bucket: string;
  allowed: boolean;
  remaining: number | null;
  retryAfterMs: number | null;
  ip: string;
};

type ParsedAuditData = {
  rows: RateLimitAuditRow[];
  byBucket: RankedItem[];
  totalEventsInWindow: number;
  blockedEventsInWindow: number;
};

type RateLimitAuditPageData = {
  rows: RateLimitAuditRow[];
  byBucket: RankedItem[];
  selectedBuckets: string[];
  ipQuery: string;
  ipMatchMode: RateLimitIpMatchMode;
  windowKey: RateLimitWindowKey;
  exportStatus: RateLimitExportStatus;
  page: number;
  totalPages: number;
  totalRows: number;
  totalEventsInWindow: number;
  blockedEventsInWindow: number;
};

type AdminRateLimitPageProps = {
  searchParams: Promise<{
    window?: string | string[];
    status?: string | string[];
    bucket?: string | string[];
    buckets?: string | string[];
    ip?: string | string[];
    ipMode?: string | string[];
    page?: string | string[];
  }>;
};

type QueryValue = string | string[] | undefined;

function getAuditLogPath(): string {
  return path.join(process.cwd(), "dev.log");
}

function getFirstQueryValue(value: QueryValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function getQueryValues(value: QueryValue): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

function parsePositiveInt(value: QueryValue, fallback: number): number {
  const parsed = Number.parseInt(getFirstQueryValue(value) || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function normalizeBucket(value: string | undefined): string | null {
  const normalized = (value || "").trim();
  return normalized ? normalized : null;
}

function normalizeIpQuery(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

function parseRequestedBuckets(input: {
  bucket: QueryValue;
  buckets: QueryValue;
}): string[] {
  const candidates = [
    ...getQueryValues(input.bucket),
    ...getQueryValues(input.buckets),
  ];
  const normalized = candidates.flatMap((item) =>
    item
      .split(",")
      .map((part) => normalizeBucket(part))
      .filter((value): value is string => Boolean(value)),
  );

  return Array.from(new Set(normalized));
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

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseRateLimitAuditLines(
  lines: string[],
  options: {
    fromMs: number;
    nowMs: number;
    exportStatus: RateLimitExportStatus;
    ipQuery: string;
    ipMatchMode: RateLimitIpMatchMode;
  },
): ParsedAuditData {
  const bucketMap = new Map<string, number>();
  const rows: RateLimitAuditRow[] = [];
  let totalEventsInWindow = 0;
  let blockedEventsInWindow = 0;

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

      const allowed = Boolean(parsed.allowed);
      totalEventsInWindow += 1;
      if (!allowed) {
        blockedEventsInWindow += 1;
      }

      const ip = typeof parsed.ip === "string" ? parsed.ip : "";
      if (options.ipQuery) {
        const normalizedIp = ip.toLowerCase();
        if (options.ipMatchMode === "exact" && normalizedIp !== options.ipQuery) {
          continue;
        }
        if (
          options.ipMatchMode === "contains" &&
          !normalizedIp.includes(options.ipQuery)
        ) {
          continue;
        }
      }

      if (options.exportStatus === "blocked" && allowed) {
        continue;
      }

      bucketMap.set(bucket, (bucketMap.get(bucket) || 0) + 1);
      rows.push({
        timestamp: new Date(timestampMs).toISOString(),
        bucket,
        allowed,
        remaining:
          typeof parsed.remaining === "number" && Number.isFinite(parsed.remaining)
            ? parsed.remaining
            : null,
        retryAfterMs:
          typeof parsed.retryAfterMs === "number" &&
          Number.isFinite(parsed.retryAfterMs)
            ? parsed.retryAfterMs
            : null,
        ip,
      });
    } catch {
      // Ignore malformed log lines.
    }
  }

  const byBucket = Array.from(bucketMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
  rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    rows,
    byBucket,
    totalEventsInWindow,
    blockedEventsInWindow,
  };
}

function buildAdminRateLimitHref(input: {
  windowKey: RateLimitWindowKey;
  exportStatus: RateLimitExportStatus;
  selectedBuckets: string[];
  ipQuery: string;
  ipMatchMode: RateLimitIpMatchMode;
  page: number;
}): string {
  const params = new URLSearchParams();
  if (!isDefaultRateLimitWindow(input.windowKey)) {
    params.set("window", input.windowKey);
  }
  if (!isDefaultRateLimitExportStatus(input.exportStatus)) {
    params.set("status", input.exportStatus);
  }
  if (input.selectedBuckets.length === 1) {
    params.set("bucket", input.selectedBuckets[0]);
  } else if (input.selectedBuckets.length > 1) {
    params.set("buckets", input.selectedBuckets.join(","));
  }
  if (input.ipQuery) {
    params.set("ip", input.ipQuery);
  }
  if (!isDefaultRateLimitIpMatchMode(input.ipMatchMode)) {
    params.set("ipMode", input.ipMatchMode);
  }
  if (input.page > 1) {
    params.set("page", String(input.page));
  }

  const query = params.toString();
  return query ? `/admin/rate-limit?${query}` : "/admin/rate-limit";
}

function buildRateLimitExportHref(input: {
  windowKey: RateLimitWindowKey;
  exportStatus: RateLimitExportStatus;
  selectedBuckets: string[];
  ipQuery: string;
  ipMatchMode: RateLimitIpMatchMode;
  scope: "all" | "page";
  page: number;
  perPage: number;
}): string {
  const params = new URLSearchParams();
  params.set("window", input.windowKey);
  params.set("status", input.exportStatus);
  params.set("ipMode", input.ipMatchMode);
  params.set("scope", input.scope);
  if (input.scope === "page") {
    params.set("page", String(input.page));
    params.set("perPage", String(input.perPage));
  }
  if (input.selectedBuckets.length === 1) {
    params.set("bucket", input.selectedBuckets[0]);
  } else if (input.selectedBuckets.length > 1) {
    params.set("buckets", input.selectedBuckets.join(","));
  }
  if (input.ipQuery) {
    params.set("ip", input.ipQuery);
  }

  return `/api/admin/rate-limit/export?${params.toString()}`;
}

async function getAuditPageData(query: {
  window?: QueryValue;
  status?: QueryValue;
  bucket?: QueryValue;
  buckets?: QueryValue;
  ip?: QueryValue;
  ipMode?: QueryValue;
  page?: QueryValue;
}): Promise<RateLimitAuditPageData> {
  const windowKey = parseRateLimitWindow(getFirstQueryValue(query.window));
  const exportStatus = parseRateLimitExportStatus(getFirstQueryValue(query.status));
  const requestedBuckets = parseRequestedBuckets({
    bucket: query.bucket,
    buckets: query.buckets,
  });
  const ipQuery = normalizeIpQuery(getFirstQueryValue(query.ip));
  const ipMatchMode = parseRateLimitIpMatchMode(getFirstQueryValue(query.ipMode));
  const requestedPage = parsePositiveInt(query.page, 1);
  const nowMs = Date.now();
  const windowDays = getRateLimitWindowDays(windowKey);
  const fromMs = nowMs - windowDays * DAY_MS;

  let lines: string[] = [];
  try {
    const content = await fs.readFile(getAuditLogPath(), "utf8");
    lines = content.split(/\r?\n/).slice(-MAX_LOG_LINES);
  } catch {
    lines = [];
  }

  const parsed = parseRateLimitAuditLines(lines, {
    fromMs,
    nowMs,
    exportStatus,
    ipQuery,
    ipMatchMode,
  });

  const validSelectedBuckets = requestedBuckets.filter((bucket) =>
    parsed.byBucket.some((item) => item.label === bucket),
  );
  const selectedBucketSet = new Set(validSelectedBuckets);
  const visibleRows =
    selectedBucketSet.size > 0
      ? parsed.rows.filter((row) => selectedBucketSet.has(row.bucket))
      : parsed.rows;
  const totalRows = visibleRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const rows = visibleRows.slice(start, start + PAGE_SIZE);

  return {
    rows,
    byBucket: parsed.byBucket,
    selectedBuckets: validSelectedBuckets,
    ipQuery,
    ipMatchMode,
    windowKey,
    exportStatus,
    page,
    totalPages,
    totalRows,
    totalEventsInWindow: parsed.totalEventsInWindow,
    blockedEventsInWindow: parsed.blockedEventsInWindow,
  };
}

function getPaginationPages(page: number, totalPages: number): number[] {
  const pages: number[] = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let i = from; i <= to; i += 1) {
    pages.push(i);
  }
  return pages;
}

export default async function AdminRateLimitPage({
  searchParams,
}: AdminRateLimitPageProps) {
  const query = await searchParams;
  const data = await getAuditPageData(query);
  const windowLinks = getRateLimitWindowOptions().map((item) => ({
    label: item.label,
    href: buildAdminRateLimitHref({
      windowKey: item.key,
      exportStatus: data.exportStatus,
      selectedBuckets: data.selectedBuckets,
      ipQuery: data.ipQuery,
      ipMatchMode: data.ipMatchMode,
      page: 1,
    }),
    isActive: data.windowKey === item.key,
  }));
  const statusLinks = getRateLimitExportStatusOptions().map((item) => ({
    label: item.label,
    href: buildAdminRateLimitHref({
      windowKey: data.windowKey,
      exportStatus: item.key,
      selectedBuckets: data.selectedBuckets,
      ipQuery: data.ipQuery,
      ipMatchMode: data.ipMatchMode,
      page: 1,
    }),
    isActive: data.exportStatus === item.key,
  }));
  const bucketLinks = [
    {
      label: "All buckets",
      href: buildAdminRateLimitHref({
        windowKey: data.windowKey,
        exportStatus: data.exportStatus,
        selectedBuckets: [],
        ipQuery: data.ipQuery,
        ipMatchMode: data.ipMatchMode,
        page: 1,
      }),
      isActive: data.selectedBuckets.length === 0,
    },
    ...data.byBucket.slice(0, 12).map((item) => ({
      label: `${item.label} (${item.count})`,
      href: buildAdminRateLimitHref({
        windowKey: data.windowKey,
        exportStatus: data.exportStatus,
        selectedBuckets: [item.label],
        ipQuery: data.ipQuery,
        ipMatchMode: data.ipMatchMode,
        page: 1,
      }),
      isActive: data.selectedBuckets.length === 1 && data.selectedBuckets[0] === item.label,
    })),
  ];
  const pages = getPaginationPages(data.page, data.totalPages);
  const exportCurrentPageHref = buildRateLimitExportHref({
    windowKey: data.windowKey,
    exportStatus: data.exportStatus,
    selectedBuckets: data.selectedBuckets,
    ipQuery: data.ipQuery,
    ipMatchMode: data.ipMatchMode,
    scope: "page",
    page: data.page,
    perPage: PAGE_SIZE,
  });
  const exportAllFilteredHref = buildRateLimitExportHref({
    windowKey: data.windowKey,
    exportStatus: data.exportStatus,
    selectedBuckets: data.selectedBuckets,
    ipQuery: data.ipQuery,
    ipMatchMode: data.ipMatchMode,
    scope: "all",
    page: 1,
    perPage: PAGE_SIZE,
  });

  return (
    <>
      <section className={styles.panel}>
        <h1>Rate Limit Audit Log</h1>
        <p>
          Browse request-level rate-limit events with window, status, bucket, and
          pagination controls.
        </p>
        <p>
          Window checks: <strong>{data.totalEventsInWindow}</strong> | Blocked:{" "}
          <strong>{data.blockedEventsInWindow}</strong> | Visible rows:{" "}
          <strong>{data.totalRows}</strong>
        </p>
        <div className={styles.filterRow}>
          {windowLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.filterRowLink} ${item.isActive ? styles.filterRowLinkActive : ""}`}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.filterRow}>
          {statusLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.filterRowLink} ${item.isActive ? styles.filterRowLinkActive : ""}`}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.filterRow}>
          {bucketLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.filterRowLink} ${item.isActive ? styles.filterRowLinkActive : ""}`}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <form action="/admin/rate-limit" method="get" className={styles.filterSearchForm}>
          {!isDefaultRateLimitWindow(data.windowKey) && (
            <input type="hidden" name="window" value={data.windowKey} />
          )}
          {!isDefaultRateLimitExportStatus(data.exportStatus) && (
            <input type="hidden" name="status" value={data.exportStatus} />
          )}
          {data.selectedBuckets.length === 1 && (
            <input type="hidden" name="bucket" value={data.selectedBuckets[0]} />
          )}
          {data.selectedBuckets.length > 1 && (
            <input type="hidden" name="buckets" value={data.selectedBuckets.join(",")} />
          )}
          <label htmlFor="ip-query">IP contains</label>
          <input
            id="ip-query"
            name="ip"
            type="text"
            placeholder="127.0.0.1"
            defaultValue={data.ipQuery}
          />
          <label htmlFor="ip-mode">IP match mode</label>
          <select id="ip-mode" name="ipMode" defaultValue={data.ipMatchMode}>
            {getRateLimitIpMatchModeOptions().map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="submit">Search</button>
        </form>
        <form action="/admin/rate-limit" method="get" className={styles.filterSearchForm}>
          {!isDefaultRateLimitWindow(data.windowKey) && (
            <input type="hidden" name="window" value={data.windowKey} />
          )}
          {!isDefaultRateLimitExportStatus(data.exportStatus) && (
            <input type="hidden" name="status" value={data.exportStatus} />
          )}
          {data.ipQuery && (
            <input type="hidden" name="ip" value={data.ipQuery} />
          )}
          {!isDefaultRateLimitIpMatchMode(data.ipMatchMode) && (
            <input type="hidden" name="ipMode" value={data.ipMatchMode} />
          )}
          <span className={styles.filterSearchLegend}>Buckets (multi-select)</span>
          <div className={styles.filterCheckboxGroup}>
            {data.byBucket.slice(0, 12).map((item) => (
              <label key={`bucket-check-${item.label}`} className={styles.filterCheckboxItem}>
                <input
                  type="checkbox"
                  name="buckets"
                  value={item.label}
                  defaultChecked={data.selectedBuckets.includes(item.label)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <button type="submit">Apply filters</button>
        </form>
        <div className={styles.filterRow}>
          <Link className={styles.filterRowLink} href={exportCurrentPageHref} prefetch={false}>
            Export current page
          </Link>
          <Link className={styles.filterRowLink} href={exportAllFilteredHref} prefetch={false}>
            Export all filtered
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Audit Events</h2>
        {data.rows.length === 0 ? (
          <p>No rate-limit events found for this filter.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Bucket</th>
                  <th>Allowed</th>
                  <th>Remaining</th>
                  <th>Retry After (ms)</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={`${row.timestamp}-${row.bucket}-${row.ip}`}>
                    <td>{formatTimestamp(row.timestamp)}</td>
                    <td>{row.bucket}</td>
                    <td>{row.allowed ? "Yes" : "No"}</td>
                    <td>{row.remaining ?? "N/A"}</td>
                    <td>{row.retryAfterMs ?? "N/A"}</td>
                    <td>{row.ip || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.filterRow}>
          {data.page > 1 && (
            <Link
              href={buildAdminRateLimitHref({
                windowKey: data.windowKey,
                exportStatus: data.exportStatus,
                selectedBuckets: data.selectedBuckets,
                ipQuery: data.ipQuery,
                ipMatchMode: data.ipMatchMode,
                page: data.page - 1,
              })}
              className={styles.filterRowLink}
            >
              Previous
            </Link>
          )}
          {pages.map((pageNumber) => (
            <Link
              key={`page-${pageNumber}`}
              href={buildAdminRateLimitHref({
                windowKey: data.windowKey,
                exportStatus: data.exportStatus,
                selectedBuckets: data.selectedBuckets,
                ipQuery: data.ipQuery,
                ipMatchMode: data.ipMatchMode,
                page: pageNumber,
              })}
              className={`${styles.filterRowLink} ${pageNumber === data.page ? styles.filterRowLinkActive : ""}`}
              aria-current={pageNumber === data.page ? "page" : undefined}
            >
              Page {pageNumber}
            </Link>
          ))}
          {data.page < data.totalPages && (
            <Link
              href={buildAdminRateLimitHref({
                windowKey: data.windowKey,
                exportStatus: data.exportStatus,
                selectedBuckets: data.selectedBuckets,
                ipQuery: data.ipQuery,
                ipMatchMode: data.ipMatchMode,
                page: data.page + 1,
              })}
              className={styles.filterRowLink}
            >
              Next
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
