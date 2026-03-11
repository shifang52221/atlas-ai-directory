import fs from "fs/promises";
import path from "path";

type RankedItem = {
  label: string;
  count: number;
};

type ParseRateLimitOptions = {
  nowMs?: number;
  windowMs: number;
  bucket?: string;
  trendDays?: number;
};

export type RateLimitAuditStats = {
  totalEvents: number;
  blockedEvents: number;
  byBucket: RankedItem[];
  blockedTrend: Array<{
    dayKey: string;
    count: number;
  }>;
  blockedTrend7d: Array<{
    dayKey: string;
    count: number;
  }>;
};

function getAuditLogPath(): string {
  return path.join(process.cwd(), "dev.log");
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

export function parseRateLimitAuditEntries(
  lines: string[],
  options: ParseRateLimitOptions,
): RateLimitAuditStats {
  const nowMs = options.nowMs ?? Date.now();
  const fromMs = nowMs - options.windowMs;
  const trendDays = Math.min(90, Math.max(1, options.trendDays ?? 7));
  const selectedBucket = (options.bucket || "").trim();
  const bucketMap = new Map<string, number>();
  const blockedByDay = new Map<string, number>();
  let totalEvents = 0;
  let blockedEvents = 0;

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
      };

      if (parsed.scope !== "rate_limit") {
        continue;
      }

      const timestampMs = toTimestampMs(parsed.timestamp);
      if (timestampMs === null || timestampMs < fromMs || timestampMs > nowMs) {
        continue;
      }

      const bucket = typeof parsed.bucket === "string" ? parsed.bucket.trim() : "";
      if (!bucket) {
        continue;
      }

      if (selectedBucket && bucket !== selectedBucket) {
        continue;
      }

      const allowed = Boolean(parsed.allowed);
      totalEvents += 1;
      if (!allowed) {
        blockedEvents += 1;
        bucketMap.set(bucket, (bucketMap.get(bucket) || 0) + 1);
        const dayKey = new Date(timestampMs).toISOString().slice(0, 10);
        blockedByDay.set(dayKey, (blockedByDay.get(dayKey) || 0) + 1);
      }
    } catch {
      // Ignore malformed log lines.
    }
  }

  const byBucket = Array.from(bucketMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

  const toTrendPoints = (days: number): Array<{ dayKey: string; count: number }> => {
    const points: Array<{ dayKey: string; count: number }> = [];
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const day = new Date(nowMs - offset * 24 * 60 * 60 * 1000);
      const dayKey = day.toISOString().slice(0, 10);
      points.push({
        dayKey,
        count: blockedByDay.get(dayKey) || 0,
      });
    }

    return points;
  };

  return {
    totalEvents,
    blockedEvents,
    byBucket,
    blockedTrend: toTrendPoints(trendDays),
    blockedTrend7d: toTrendPoints(7),
  };
}

export async function getRateLimitAuditStatsFromFile(options?: {
  filePath?: string;
  nowMs?: number;
  windowMs?: number;
  bucket?: string;
  trendDays?: number;
}): Promise<RateLimitAuditStats> {
  const filePath = options?.filePath || getAuditLogPath();
  const windowMs = options?.windowMs ?? 24 * 60 * 60 * 1000;

  try {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    const sampledLines = lines.slice(-20000);

    return parseRateLimitAuditEntries(sampledLines, {
      nowMs: options?.nowMs,
      windowMs,
      bucket: options?.bucket,
      trendDays: options?.trendDays,
    });
  } catch {
    const fallbackNow = options?.nowMs ?? Date.now();
    const fallbackTrendDays = Math.min(90, Math.max(1, options?.trendDays ?? 7));
    const buildFallbackTrend = (days: number): Array<{ dayKey: string; count: number }> => {
      const points: Array<{ dayKey: string; count: number }> = [];
      for (let offset = days - 1; offset >= 0; offset -= 1) {
        const day = new Date(fallbackNow - offset * 24 * 60 * 60 * 1000);
        points.push({
          dayKey: day.toISOString().slice(0, 10),
          count: 0,
        });
      }

      return points;
    };

    return {
      totalEvents: 0,
      blockedEvents: 0,
      byBucket: [],
      blockedTrend: buildFallbackTrend(fallbackTrendDays),
      blockedTrend7d: buildFallbackTrend(7),
    };
  }
}
