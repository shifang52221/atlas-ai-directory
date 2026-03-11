import Link from "next/link";
import { getRateLimitAuditStatsFromFile } from "@/lib/admin-audit-stats";
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
import { getDb } from "@/lib/db";
import styles from "../admin.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;

type TrendPoint = {
  label: string;
  count: number;
};

type RankedItem = {
  label: string;
  count: number;
};

type DashboardStats = {
  dbAvailable: boolean;
  toolCount: number;
  categoryCount: number;
  affiliateLinks: number;
  clicks24h: number;
  pendingSubmissions: number;
  trend: TrendPoint[];
  topTools: RankedItem[];
  topUseCases: RankedItem[];
  rateLimitEvents24h: number;
  rateLimitBlocked24h: number;
  rateLimitBuckets: RankedItem[];
  rateLimitFilterBuckets: RankedItem[];
  rateLimitTrend7d: TrendPoint[];
  rateLimitSelectedBucket: string | null;
  rateLimitWindowKey: RateLimitWindowKey;
  rateLimitExportStatus: RateLimitExportStatus;
};

type AdminDashboardPageProps = {
  searchParams: Promise<{
    bucket?: string;
    window?: string;
    status?: string;
  }>;
};

function getLast7DayKeys(): string[] {
  const keys: string[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    keys.push(date.toISOString().slice(0, 10));
  }
  return keys;
}

function toDayLabel(dayKey: string): string {
  return new Date(dayKey).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getUseCaseLabelFromPath(pagePath: string): string | null {
  if (!pagePath.startsWith("/use-cases/")) {
    return null;
  }

  const slug = pagePath.replace("/use-cases/", "").trim();
  if (!slug) {
    return null;
  }

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeBucketValue(value: string | undefined): string | null {
  const normalized = (value || "").trim();
  return normalized ? normalized : null;
}

function buildAdminDashboardHref(input: {
  bucket: string | null;
  windowKey: RateLimitWindowKey;
  exportStatus: RateLimitExportStatus;
}): string {
  const params = new URLSearchParams();

  if (!isDefaultRateLimitWindow(input.windowKey)) {
    params.set("window", input.windowKey);
  }
  if (!isDefaultRateLimitExportStatus(input.exportStatus)) {
    params.set("status", input.exportStatus);
  }
  if (input.bucket) {
    params.set("bucket", input.bucket);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

function buildRateLimitExportHref(input: {
  bucket: string | null;
  windowKey: RateLimitWindowKey;
  exportStatus: RateLimitExportStatus;
}): string {
  const params = new URLSearchParams();
  params.set("window", input.windowKey);
  params.set("status", input.exportStatus);

  if (input.bucket) {
    params.set("bucket", input.bucket);
  }

  return `/api/admin/rate-limit/export?${params.toString()}`;
}

async function getDashboardStats(
  selectedBucket: string | null,
  windowKey: RateLimitWindowKey,
  exportStatus: RateLimitExportStatus,
): Promise<DashboardStats> {
  const trendWindowDays = getRateLimitWindowDays(windowKey);
  const [rateLimitStats24h, rateLimitStats7d] = await Promise.all([
    getRateLimitAuditStatsFromFile({ windowMs: DAY_MS }),
    getRateLimitAuditStatsFromFile({
      windowMs: trendWindowDays * DAY_MS,
      trendDays: trendWindowDays,
    }),
  ]);
  const safeSelectedBucket =
    selectedBucket &&
    rateLimitStats7d.byBucket.some((item) => item.label === selectedBucket)
      ? selectedBucket
      : null;
  const rateLimitTrendSource = safeSelectedBucket
    ? await getRateLimitAuditStatsFromFile({
        windowMs: trendWindowDays * DAY_MS,
        trendDays: trendWindowDays,
        bucket: safeSelectedBucket,
      })
    : rateLimitStats7d;
  const rateLimitTrend7d = rateLimitTrendSource.blockedTrend.map((point) => ({
    label: toDayLabel(point.dayKey),
    count: point.count,
  }));

  try {
    const db = getDb();
    const since24h = new Date(Date.now() - DAY_MS);
    const since7days = new Date(Date.now() - 6 * DAY_MS);

    const [toolCount, categoryCount, affiliateLinks, clicks24h, pendingSubmissions, clickEvents] =
      await Promise.all([
        db.tool.count(),
        db.category.count(),
        db.affiliateLink.count(),
        db.clickEvent.count({
          where: { createdAt: { gte: since24h } },
        }),
        db.submission.count({
          where: { status: "PENDING" },
        }),
        db.clickEvent.findMany({
          where: { createdAt: { gte: since7days } },
          select: {
            createdAt: true,
            pagePath: true,
            tool: { select: { name: true } },
          },
        }),
      ]);

    const dayKeys = getLast7DayKeys();
    const trendMap = new Map(dayKeys.map((key) => [key, 0]));
    const toolMap = new Map<string, number>();
    const useCaseMap = new Map<string, number>();

    for (const event of clickEvents) {
      const dayKey = event.createdAt.toISOString().slice(0, 10);
      if (trendMap.has(dayKey)) {
        trendMap.set(dayKey, (trendMap.get(dayKey) || 0) + 1);
      }

      if (event.tool?.name) {
        toolMap.set(event.tool.name, (toolMap.get(event.tool.name) || 0) + 1);
      }

      const useCaseLabel = getUseCaseLabelFromPath(event.pagePath);
      if (useCaseLabel) {
        useCaseMap.set(useCaseLabel, (useCaseMap.get(useCaseLabel) || 0) + 1);
      }
    }

    const trend: TrendPoint[] = dayKeys.map((dayKey) => ({
      label: toDayLabel(dayKey),
      count: trendMap.get(dayKey) || 0,
    }));

    const topTools = Array.from(toolMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    const topUseCases = Array.from(useCaseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    return {
      dbAvailable: true,
      toolCount,
      categoryCount,
      affiliateLinks,
      clicks24h,
      pendingSubmissions,
      trend,
      topTools,
      topUseCases,
      rateLimitEvents24h: rateLimitStats24h.totalEvents,
      rateLimitBlocked24h: rateLimitStats24h.blockedEvents,
      rateLimitBuckets: rateLimitStats24h.byBucket.slice(0, 5),
      rateLimitFilterBuckets: rateLimitStats7d.byBucket.slice(0, 8),
      rateLimitTrend7d,
      rateLimitSelectedBucket: safeSelectedBucket,
      rateLimitWindowKey: windowKey,
      rateLimitExportStatus: exportStatus,
    };
  } catch {
    return {
      dbAvailable: false,
      toolCount: 0,
      categoryCount: 0,
      affiliateLinks: 0,
      clicks24h: 0,
      pendingSubmissions: 0,
      trend: [],
      topTools: [],
      topUseCases: [],
      rateLimitEvents24h: rateLimitStats24h.totalEvents,
      rateLimitBlocked24h: rateLimitStats24h.blockedEvents,
      rateLimitBuckets: rateLimitStats24h.byBucket.slice(0, 5),
      rateLimitFilterBuckets: rateLimitStats7d.byBucket.slice(0, 8),
      rateLimitTrend7d,
      rateLimitSelectedBucket: safeSelectedBucket,
      rateLimitWindowKey: windowKey,
      rateLimitExportStatus: exportStatus,
    };
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const query = await searchParams;
  const selectedBucket = normalizeBucketValue(query.bucket);
  const selectedWindowKey = parseRateLimitWindow(query.window);
  const selectedExportStatus = parseRateLimitExportStatus(query.status);
  const stats = await getDashboardStats(
    selectedBucket,
    selectedWindowKey,
    selectedExportStatus,
  );
  const trendMax = Math.max(1, ...stats.trend.map((item) => item.count));
  const rateLimitTrendMax = Math.max(
    1,
    ...stats.rateLimitTrend7d.map((item) => item.count),
  );
  const windowFilterLinks = getRateLimitWindowOptions().map((item) => ({
    href: buildAdminDashboardHref({
      bucket: stats.rateLimitSelectedBucket,
      windowKey: item.key,
      exportStatus: stats.rateLimitExportStatus,
    }),
    label: item.label,
    isActive: stats.rateLimitWindowKey === item.key,
  }));
  const statusFilterLinks = getRateLimitExportStatusOptions().map((item) => ({
    href: buildAdminDashboardHref({
      bucket: stats.rateLimitSelectedBucket,
      windowKey: stats.rateLimitWindowKey,
      exportStatus: item.key,
    }),
    label: item.label,
    isActive: stats.rateLimitExportStatus === item.key,
  }));
  const bucketFilterLinks = [
    {
      href: buildAdminDashboardHref({
        bucket: null,
        windowKey: stats.rateLimitWindowKey,
        exportStatus: stats.rateLimitExportStatus,
      }),
      label: "All buckets",
      isActive: !stats.rateLimitSelectedBucket,
    },
    ...stats.rateLimitFilterBuckets.map((bucket) => ({
      href: buildAdminDashboardHref({
        bucket: bucket.label,
        windowKey: stats.rateLimitWindowKey,
        exportStatus: stats.rateLimitExportStatus,
      }),
      label: `${bucket.label} (${bucket.count})`,
      isActive: stats.rateLimitSelectedBucket === bucket.label,
    })),
  ];
  const exportCsvHref = buildRateLimitExportHref({
    bucket: stats.rateLimitSelectedBucket,
    windowKey: stats.rateLimitWindowKey,
    exportStatus: stats.rateLimitExportStatus,
  });

  return (
    <>
      <section className={styles.panel}>
        <h1>Admin Dashboard</h1>
        <p>
          Monitor traffic trends, top converting entities, and pending review
          workload from one place.
        </p>
        {!stats.dbAvailable && (
          <p className={styles.infoNote}>
            Database is currently unavailable. Dashboard uses fallback values until
            connection is restored.
          </p>
        )}
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Tools</p>
          <span className={styles.statValue}>{stats.toolCount}</span>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Categories</p>
          <span className={styles.statValue}>{stats.categoryCount}</span>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Affiliate Links</p>
          <span className={styles.statValue}>{stats.affiliateLinks}</span>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Clicks (24h)</p>
          <span className={styles.statValue}>{stats.clicks24h}</span>
        </article>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.panel}>
          <h2>Clicks Trend (7 days)</h2>
          {stats.trend.length === 0 ? (
            <p>No click trend data yet.</p>
          ) : (
            <div className={styles.trendGrid}>
              {stats.trend.map((point) => (
                <div className={styles.trendItem} key={point.label}>
                  <div
                    className={styles.trendBar}
                    style={{ height: `${Math.max(10, (point.count / trendMax) * 120)}px` }}
                  />
                  <span className={styles.trendCount}>{point.count}</span>
                  <span className={styles.trendLabel}>{point.label}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={styles.panel}>
          <h2>Top Tools (7 days)</h2>
          {stats.topTools.length === 0 ? (
            <p>No outbound clicks on tools yet.</p>
          ) : (
            <ul className={styles.rankList}>
              {stats.topTools.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.panel}>
          <h2>Top Use Cases (7 days)</h2>
          {stats.topUseCases.length === 0 ? (
            <p>No use-case click data yet.</p>
          ) : (
            <ul className={styles.rankList}>
              {stats.topUseCases.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.panel}>
          <h2>Rate Limit Events (24h)</h2>
          <p>
            Total checks: <strong>{stats.rateLimitEvents24h}</strong> | Blocked:{" "}
            <strong>{stats.rateLimitBlocked24h}</strong>
          </p>
          {stats.rateLimitBuckets.length === 0 ? (
            <p>No blocked rate-limit events in the last 24 hours.</p>
          ) : (
            <ul className={styles.rankList}>
              {stats.rateLimitBuckets.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          )}

          <h3>
            Rate Limit Blocked Trend ({stats.rateLimitWindowKey})
            {stats.rateLimitSelectedBucket && (
              <span className={styles.filterTag}>{stats.rateLimitSelectedBucket}</span>
            )}
          </h3>
          <div className={styles.filterRow}>
            {windowFilterLinks.map((item) => (
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
            {statusFilterLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.filterRowLink} ${item.isActive ? styles.filterRowLinkActive : ""}`}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link className={styles.filterRowLink} href={exportCsvHref} prefetch={false}>
              Export CSV
            </Link>
          </div>
          <div className={styles.filterRow}>
            {bucketFilterLinks.map((item) => (
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
          <div className={styles.trendGrid}>
            {stats.rateLimitTrend7d.map((point) => (
              <div className={styles.trendItem} key={point.label}>
                <div
                  className={styles.trendBar}
                  style={{
                    height: `${Math.max(10, (point.count / rateLimitTrendMax) * 120)}px`,
                  }}
                />
                <span className={styles.trendCount}>{point.count}</span>
                <span className={styles.trendLabel}>{point.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <h2>Next Operation</h2>
        <p>
          Pending submissions: <strong>{stats.pendingSubmissions}</strong>.
          Process reviews first, then optimize high-traffic pages.
        </p>
        <div className={styles.quickLinks}>
          <Link href="/admin/tools">Open Tool Management</Link>
          <Link href="/admin/affiliate">Open Affiliate Performance</Link>
          <Link href="/admin/categories">Open Category Management</Link>
          <Link href="/admin/submissions">Open Submission Review</Link>
          <Link href="/admin/rate-limit">Open Rate Limit Audit</Link>
        </div>
      </section>
    </>
  );
}
