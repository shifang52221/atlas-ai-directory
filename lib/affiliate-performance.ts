import fs from "fs/promises";
import path from "path";
import { EventType, ToolStatus } from "@prisma/client";
import { getDb } from "./db";
import { getEditorialHubConfig, getEditorialHubPaths } from "./editorial-hubs";
import { getFallbackToolProfiles } from "./tool-profile-data";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AffiliateManualMetricKind = "IMPRESSION" | "CONVERSION";

type ParseManualMetricOptions = {
  nowMs?: number;
  windowMs: number;
};

type ParseManualDailyOptions = ParseManualMetricOptions & {
  toolSlug?: string;
};

type ParseManualHistoryOptions = ParseManualMetricOptions & {
  toolSlug?: string;
  kind?: AffiliateManualMetricKind;
  page?: number;
  perPage?: number;
};

type ParsedManualMetricEntry = {
  timestampMs: number;
  dayKey: string;
  toolSlug: string;
  kind: AffiliateManualMetricKind;
  count: number;
  note?: string;
};

type RemoveManualMetricResult = {
  removed: boolean;
  linesAfter: string[];
  removedEntry?: AffiliateManualMetricHistoryItem;
};

type ReplaceManualMetricResult = {
  replaced: boolean;
  linesAfter: string[];
  oldEntry?: AffiliateManualMetricHistoryItem;
  newEntry?: AffiliateManualMetricHistoryItem;
};

export type AffiliateToolPerformanceRow = {
  toolSlug: string;
  toolName: string;
  impressions: number;
  affiliateClicks: number;
  outboundClicks: number;
  conversions: number;
  conversionRate: number;
  hasPrimaryLink: boolean;
};

export type AffiliateTrendPoint = {
  dayKey: string;
  outboundClicks: number;
  conversions: number;
  conversionRate: number;
};

export type AffiliateHubCtrRow = {
  pagePath: string;
  pageTitle: string;
  impressions: number;
  outboundClicks: number;
  ctr: number;
  topToolSlug: string | null;
  topToolName: string | null;
};

export type AffiliateHubTrendPoint = {
  dayKey: string;
  impressions: number;
  outboundClicks: number;
  ctr: number;
};

export type AffiliateAttributionDimensionRow = {
  key: string;
  label: string;
  clicks: number;
};

export type AffiliateHubVariantSummary = {
  impressionsA: number;
  outboundClicksA: number;
  ctrA: number;
  impressionsB: number;
  outboundClicksB: number;
  ctrB: number;
  liftBvsA: number | null;
};

export type AffiliateHubExperimentSignal =
  | "B_LEADING"
  | "A_LEADING"
  | "NO_SIGNAL";

export type AffiliateHubExperimentDecision =
  | "SHIP_B"
  | "KEEP_A"
  | "RUN_LONGER";

type AffiliateHubExperimentVariantStats = {
  A: {
    impressions: number;
    outboundClicks: number;
  };
  B: {
    impressions: number;
    outboundClicks: number;
  };
};

export type AffiliateHubExperimentCtrRow = {
  pagePath: string;
  pageTitle: string;
  impressionsA: number;
  outboundClicksA: number;
  ctrA: number;
  impressionsB: number;
  outboundClicksB: number;
  ctrB: number;
  liftBvsA: number | null;
  pValue: number | null;
  confidence: number | null;
  isSignificant: boolean;
  signal: AffiliateHubExperimentSignal;
};

export type AffiliateHubExperimentConclusion = {
  pagePath: string;
  pageTitle: string;
  decision: AffiliateHubExperimentDecision;
  reason: string;
  liftBvsA: number | null;
  pValue: number | null;
  confidence: number | null;
  impressionsA: number;
  impressionsB: number;
};

export type AffiliateHubActionRecommendation = {
  pagePath: string;
  pageTitle: string;
  impressions: number;
  outboundClicks: number;
  ctr: number;
  expectedLiftRange: string;
  priority: "HIGH" | "MEDIUM";
  executionStatus: AffiliateHubActionStatus;
  executionNote?: string;
  executionUpdatedAt?: string;
  recommendation: string;
  suggestedToolNames: string[];
};

export type AffiliateHubActionStatus = "TODO" | "TESTING" | "VERIFIED" | "DISMISSED";
export type AffiliateHubActionStatusFilter =
  | "ALL"
  | "UNVERIFIED"
  | AffiliateHubActionStatus;
export type AffiliateHubActionSortKey = "UPDATED_DESC" | "UPDATED_ASC";
export type AffiliateHubActionStatusCounts = {
  ALL: number;
  TODO: number;
  TESTING: number;
  VERIFIED: number;
  DISMISSED: number;
  UNVERIFIED: number;
};

type AffiliateHubActionState = {
  status: AffiliateHubActionStatus;
  note?: string;
  updatedAt: string;
};

export type AffiliateManualMetricHistoryItem = {
  id: string;
  timestamp: string;
  toolSlug: string;
  kind: AffiliateManualMetricKind;
  count: number;
  note?: string;
};

export type AffiliateManualMetricHistory = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  items: AffiliateManualMetricHistoryItem[];
};

export const DEFAULT_LOW_CVR_MIN_OUTBOUND_CLICKS = 20;
export const DEFAULT_LOW_CVR_MAX_CONVERSION_RATE = 0.025;
export const DEFAULT_LOW_HUB_CTR_MIN_IMPRESSIONS = 20;
export const DEFAULT_LOW_HUB_CTR_MAX_CTR = 0.12;
export const DEFAULT_HUB_EXPERIMENT_MIN_IMPRESSIONS = 20;
export const DEFAULT_HUB_EXPERIMENT_MIN_ABSOLUTE_LIFT = 0.1;

export type AffiliatePerformanceData = {
  dbAvailable: boolean;
  windowDays: number;
  toolOptions: Array<{ slug: string; name: string }>;
  hubOptions: Array<{ path: string; title: string }>;
  trendToolSlug: string | null;
  hubTrendPath: string | null;
  totals: {
    impressions: number;
    affiliateClicks: number;
    outboundClicks: number;
    conversions: number;
    conversionRate: number;
  };
  trend: AffiliateTrendPoint[];
  hubCtrRows: AffiliateHubCtrRow[];
  hubExperimentRows: AffiliateHubExperimentCtrRow[];
  hubVariantSummary: AffiliateHubVariantSummary;
  hubExperimentConclusions: AffiliateHubExperimentConclusion[];
  hubTrend: AffiliateHubTrendPoint[];
  outboundByCountry: AffiliateAttributionDimensionRow[];
  outboundByPlacement: AffiliateAttributionDimensionRow[];
  outboundByLinkKind: AffiliateAttributionDimensionRow[];
  experimentThresholds: {
    minImpressionsPerVariant: number;
    minAbsoluteLift: number;
  };
  lowHubCtrCandidates: AffiliateHubCtrRow[];
  hubActionRecommendations: AffiliateHubActionRecommendation[];
  topConverters: AffiliateToolPerformanceRow[];
  lowCvrCandidates: AffiliateToolPerformanceRow[];
  manualHistory: AffiliateManualMetricHistory;
  rows: AffiliateToolPerformanceRow[];
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

function toPositiveInt(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
}

function toDayKey(timestampMs: number): string {
  return new Date(timestampMs).toISOString().slice(0, 10);
}

function toHubMetadataObject(
  metadata: unknown,
): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  return metadata as Record<string, unknown>;
}

function parseHubEventVariantFromMetadata(metadata: unknown): "A" | "B" {
  const parsed = toHubMetadataObject(metadata);
  const raw = parsed?.variant;
  if (typeof raw === "string" && raw.trim().toUpperCase() === "B") {
    return "B";
  }
  return "A";
}

function parseLinkKindFromMetadata(
  metadata: unknown,
): "AFFILIATE" | "SPONSORED" | "DIRECT" | "UNSPECIFIED" {
  const parsed = toHubMetadataObject(metadata);
  const raw = typeof parsed?.linkKind === "string" ? parsed.linkKind.trim().toUpperCase() : "";
  if (raw === "AFFILIATE" || raw === "SPONSORED" || raw === "DIRECT") {
    return raw;
  }
  return "UNSPECIFIED";
}

function parsePlacementFromMetadata(metadata: unknown): string {
  const parsed = toHubMetadataObject(metadata);
  const raw =
    typeof parsed?.placementId === "string" ? parsed.placementId.trim() : "";
  if (!raw) {
    return "unspecified";
  }
  return raw;
}

function parseCountryCodeFromMetadata(
  metadata: unknown,
  countryCode: string | null | undefined,
): string {
  const fromColumn = (countryCode || "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(fromColumn)) {
    return fromColumn;
  }

  const parsed = toHubMetadataObject(metadata);
  const fromMetadata =
    typeof parsed?.countryCode === "string"
      ? parsed.countryCode.trim().toUpperCase()
      : "";
  if (/^[A-Z]{2}$/.test(fromMetadata)) {
    return fromMetadata;
  }

  return "UNSPECIFIED";
}

export function resolveExperimentThresholds(input?: {
  envMinImpressionsRaw?: string;
  envMinAbsoluteLiftRaw?: string;
  overrideMinImpressionsPerVariant?: number;
  overrideMinAbsoluteLift?: number;
}): {
  minImpressionsPerVariant: number;
  minAbsoluteLift: number;
} {
  const envImpressionsRaw =
    input?.envMinImpressionsRaw ??
    process.env.AFFILIATE_HUB_MIN_IMPRESSIONS_PER_VARIANT ??
    "";
  const envLiftRaw =
    input?.envMinAbsoluteLiftRaw ??
    process.env.AFFILIATE_HUB_MIN_ABSOLUTE_LIFT ??
    "";

  const parsedEnvImpressions = Number.parseInt(envImpressionsRaw, 10);
  const parsedEnvLift = Number.parseFloat(envLiftRaw);

  const envMinImpressionsPerVariant =
    Number.isFinite(parsedEnvImpressions) && parsedEnvImpressions > 0
      ? parsedEnvImpressions
      : DEFAULT_HUB_EXPERIMENT_MIN_IMPRESSIONS;
  const envMinAbsoluteLift =
    Number.isFinite(parsedEnvLift) && parsedEnvLift >= 0
      ? parsedEnvLift
      : DEFAULT_HUB_EXPERIMENT_MIN_ABSOLUTE_LIFT;

  const overrideImpressions = input?.overrideMinImpressionsPerVariant;
  const overrideLift = input?.overrideMinAbsoluteLift;

  const minImpressionsPerVariant =
    Number.isFinite(overrideImpressions) &&
    typeof overrideImpressions === "number" &&
    overrideImpressions > 0
      ? Math.floor(overrideImpressions)
      : envMinImpressionsPerVariant;
  const minAbsoluteLift =
    Number.isFinite(overrideLift) &&
    typeof overrideLift === "number" &&
    overrideLift >= 0
      ? overrideLift
      : envMinAbsoluteLift;

  return {
    minImpressionsPerVariant,
    minAbsoluteLift,
  };
}

function isHubImpressionEventMetadata(metadata: unknown): boolean {
  const parsed = toHubMetadataObject(metadata);
  return parsed?.kind === "HUB_IMPRESSION";
}

function parseAffiliateManualMetricLine(line: string): ParsedManualMetricEntry | null {
  if (!line.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(line) as {
      timestamp?: unknown;
      scope?: unknown;
      kind?: unknown;
      toolSlug?: unknown;
      count?: unknown;
      note?: unknown;
    };

    if (parsed.scope !== "affiliate_performance") {
      return null;
    }

    const timestampMs = toTimestampMs(parsed.timestamp);
    if (timestampMs === null) {
      return null;
    }

    const toolSlug =
      typeof parsed.toolSlug === "string" ? parsed.toolSlug.trim() : "";
    if (!toolSlug) {
      return null;
    }

    const count = toPositiveInt(parsed.count);
    if (count <= 0) {
      return null;
    }

    if (parsed.kind !== "IMPRESSION" && parsed.kind !== "CONVERSION") {
      return null;
    }
    const note =
      typeof parsed.note === "string" ? parsed.note.trim() || undefined : undefined;

    return {
      timestampMs,
      dayKey: toDayKey(timestampMs),
      toolSlug,
      kind: parsed.kind,
      count,
      note,
    };
  } catch {
    return null;
  }
}

function parseAffiliateHubActionLine(line: string): {
  timestampMs: number;
  pagePath: string;
  status: AffiliateHubActionStatus;
  note?: string;
} | null {
  if (!line.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(line) as {
      timestamp?: unknown;
      scope?: unknown;
      pagePath?: unknown;
      status?: unknown;
      note?: unknown;
    };

    if (parsed.scope !== "affiliate_hub_action") {
      return null;
    }

    const timestampMs = toTimestampMs(parsed.timestamp);
    if (timestampMs === null) {
      return null;
    }

    const pagePath = typeof parsed.pagePath === "string" ? parsed.pagePath.trim() : "";
    if (!pagePath) {
      return null;
    }

    if (
      parsed.status !== "TODO" &&
      parsed.status !== "TESTING" &&
      parsed.status !== "VERIFIED" &&
      parsed.status !== "DISMISSED"
    ) {
      return null;
    }

    const note =
      typeof parsed.note === "string" ? parsed.note.trim() || undefined : undefined;

    return {
      timestampMs,
      pagePath,
      status: parsed.status,
      note,
    };
  } catch {
    return null;
  }
}

function isInWindow(timestampMs: number, fromMs: number, nowMs: number): boolean {
  return timestampMs >= fromMs && timestampMs <= nowMs;
}

function getRecentDayKeys(windowDays: number, nowMs: number): string[] {
  const days: string[] = [];
  const base = new Date(nowMs);
  base.setUTCHours(0, 0, 0, 0);

  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() - offset);
    days.push(date.toISOString().slice(0, 10));
  }

  return days;
}

function buildManualMetricHistoryId(
  entry: ParsedManualMetricEntry,
  lineIndex: number,
): string {
  return `${entry.timestampMs}:${entry.toolSlug}:${entry.kind}:${entry.count}:${lineIndex}`;
}

function buildAffiliateManualMetricLine(input: {
  timestamp: string;
  toolSlug: string;
  kind: AffiliateManualMetricKind;
  count: number;
  note?: string;
}): string {
  return JSON.stringify({
    timestamp: input.timestamp,
    scope: "affiliate_performance",
    toolSlug: input.toolSlug.trim(),
    kind: input.kind,
    count: Math.max(1, Math.floor(input.count)),
    note: input.note?.trim() || undefined,
  });
}

export function parseAffiliateManualMetricEntries(
  lines: string[],
  options: ParseManualMetricOptions,
): {
  impressionsByTool: Map<string, number>;
  conversionsByTool: Map<string, number>;
} {
  const nowMs = options.nowMs ?? Date.now();
  const fromMs = nowMs - options.windowMs;
  const impressionsByTool = new Map<string, number>();
  const conversionsByTool = new Map<string, number>();

  for (const line of lines) {
    const entry = parseAffiliateManualMetricLine(line);
    if (!entry || !isInWindow(entry.timestampMs, fromMs, nowMs)) {
      continue;
    }

    if (entry.kind === "IMPRESSION") {
      impressionsByTool.set(
        entry.toolSlug,
        (impressionsByTool.get(entry.toolSlug) || 0) + entry.count,
      );
      continue;
    }

    if (entry.kind === "CONVERSION") {
      conversionsByTool.set(
        entry.toolSlug,
        (conversionsByTool.get(entry.toolSlug) || 0) + entry.count,
      );
    }
  }

  return {
    impressionsByTool,
    conversionsByTool,
  };
}

export function parseAffiliateManualConversionDailySeries(
  lines: string[],
  options: ParseManualDailyOptions,
): Map<string, number> {
  const nowMs = options.nowMs ?? Date.now();
  const fromMs = nowMs - options.windowMs;
  const targetToolSlug = options.toolSlug?.trim() || "";
  const daily = new Map<string, number>();

  for (const line of lines) {
    const entry = parseAffiliateManualMetricLine(line);
    if (!entry || entry.kind !== "CONVERSION") {
      continue;
    }
    if (!isInWindow(entry.timestampMs, fromMs, nowMs)) {
      continue;
    }
    if (targetToolSlug && entry.toolSlug !== targetToolSlug) {
      continue;
    }

    daily.set(entry.dayKey, (daily.get(entry.dayKey) || 0) + entry.count);
  }

  return daily;
}

export function parseAffiliateManualMetricHistory(
  lines: string[],
  options: ParseManualHistoryOptions,
): AffiliateManualMetricHistory {
  const nowMs = options.nowMs ?? Date.now();
  const fromMs = nowMs - options.windowMs;
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Math.floor(options.perPage ?? 20)));
  const toolSlug = options.toolSlug?.trim() || "";
  const kind = options.kind;

  const items: AffiliateManualMetricHistoryItem[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const entry = parseAffiliateManualMetricLine(lines[index] || "");
    if (!entry || !isInWindow(entry.timestampMs, fromMs, nowMs)) {
      continue;
    }
    if (toolSlug && entry.toolSlug !== toolSlug) {
      continue;
    }
    if (kind && entry.kind !== kind) {
      continue;
    }

    items.push({
      id: buildManualMetricHistoryId(entry, index),
      timestamp: new Date(entry.timestampMs).toISOString(),
      toolSlug: entry.toolSlug,
      kind: entry.kind,
      count: entry.count,
      note: entry.note,
    });
  }

  items.sort((a, b) => {
    if (a.timestamp === b.timestamp) {
      return a.id < b.id ? 1 : -1;
    }
    return a.timestamp < b.timestamp ? 1 : -1;
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;

  return {
    page: safePage,
    perPage,
    total,
    totalPages,
    items: items.slice(start, start + perPage),
  };
}

export function removeAffiliateManualMetricByIdFromLines(
  lines: string[],
  entryId: string,
): RemoveManualMetricResult {
  const targetId = entryId.trim();
  if (!targetId) {
    return { removed: false, linesAfter: lines.slice() };
  }

  const linesAfter: string[] = [];
  let removedEntry: AffiliateManualMetricHistoryItem | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] || "";
    const parsed = parseAffiliateManualMetricLine(line);
    if (!parsed) {
      linesAfter.push(line);
      continue;
    }

    const currentId = buildManualMetricHistoryId(parsed, index);
    if (currentId !== targetId || removedEntry) {
      linesAfter.push(line);
      continue;
    }

    removedEntry = {
      id: currentId,
      timestamp: new Date(parsed.timestampMs).toISOString(),
      toolSlug: parsed.toolSlug,
      kind: parsed.kind,
      count: parsed.count,
      note: parsed.note,
    };
  }

  return {
    removed: Boolean(removedEntry),
    linesAfter,
    removedEntry,
  };
}

export function replaceAffiliateManualMetricByIdFromLines(
  lines: string[],
  entryId: string,
  input: {
    toolSlug: string;
    kind: AffiliateManualMetricKind;
    count: number;
    note?: string;
  },
): ReplaceManualMetricResult {
  const targetId = entryId.trim();
  if (!targetId) {
    return { replaced: false, linesAfter: lines.slice() };
  }

  const linesAfter: string[] = [];
  let oldEntry: AffiliateManualMetricHistoryItem | undefined;
  let newEntry: AffiliateManualMetricHistoryItem | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] || "";
    const parsed = parseAffiliateManualMetricLine(line);
    if (!parsed) {
      linesAfter.push(line);
      continue;
    }

    const currentId = buildManualMetricHistoryId(parsed, index);
    if (currentId !== targetId || oldEntry) {
      linesAfter.push(line);
      continue;
    }

    const timestamp = new Date(parsed.timestampMs).toISOString();
    const updatedLine = buildAffiliateManualMetricLine({
      timestamp,
      toolSlug: input.toolSlug,
      kind: input.kind,
      count: input.count,
      note: input.note,
    });
    linesAfter.push(updatedLine);

    oldEntry = {
      id: currentId,
      timestamp,
      toolSlug: parsed.toolSlug,
      kind: parsed.kind,
      count: parsed.count,
      note: parsed.note,
    };
    newEntry = {
      id: currentId,
      timestamp,
      toolSlug: input.toolSlug.trim(),
      kind: input.kind,
      count: Math.max(1, Math.floor(input.count)),
      note: input.note?.trim() || undefined,
    };
  }

  return {
    replaced: Boolean(oldEntry && newEntry),
    linesAfter,
    oldEntry,
    newEntry,
  };
}

export function buildAffiliateTrendSeries(input: {
  dayKeys: string[];
  outboundClicksByDay: Map<string, number>;
  conversionsByDay: Map<string, number>;
}): AffiliateTrendPoint[] {
  return input.dayKeys.map((dayKey) => {
    const outboundClicks = input.outboundClicksByDay.get(dayKey) || 0;
    const conversions = input.conversionsByDay.get(dayKey) || 0;
    return {
      dayKey,
      outboundClicks,
      conversions,
      conversionRate: outboundClicks > 0 ? conversions / outboundClicks : 0,
    };
  });
}

export function getTopConverters(
  rows: AffiliateToolPerformanceRow[],
  limit = 5,
): AffiliateToolPerformanceRow[] {
  return rows
    .filter((row) => row.conversions > 0)
    .slice()
    .sort((a, b) => {
      if (b.conversions !== a.conversions) {
        return b.conversions - a.conversions;
      }
      if (b.outboundClicks !== a.outboundClicks) {
        return b.outboundClicks - a.outboundClicks;
      }
      return b.conversionRate - a.conversionRate;
    })
    .slice(0, Math.max(1, limit));
}

export function getLowCvrCandidates(
  rows: AffiliateToolPerformanceRow[],
  options?: {
    minOutboundClicks?: number;
    maxConversionRate?: number;
    limit?: number;
  },
): AffiliateToolPerformanceRow[] {
  const minOutboundClicks = Math.max(
    1,
    options?.minOutboundClicks ?? DEFAULT_LOW_CVR_MIN_OUTBOUND_CLICKS,
  );
  const maxConversionRate = Math.max(
    0,
    options?.maxConversionRate ?? DEFAULT_LOW_CVR_MAX_CONVERSION_RATE,
  );
  const limit = Math.max(1, options?.limit ?? 5);

  return rows
    .filter(
      (row) =>
        row.hasPrimaryLink &&
        row.outboundClicks >= minOutboundClicks &&
        row.conversionRate <= maxConversionRate,
    )
    .slice()
    .sort((a, b) => {
      if (b.outboundClicks !== a.outboundClicks) {
        return b.outboundClicks - a.outboundClicks;
      }
      if (a.conversionRate !== b.conversionRate) {
        return a.conversionRate - b.conversionRate;
      }
      return b.impressions - a.impressions;
    })
    .slice(0, limit);
}

export function buildAffiliateHubCtrRows(input: {
  pagePaths: string[];
  labelsByPath: Map<string, string>;
  impressionsByPath: Map<string, number>;
  outboundByPath: Map<string, number>;
  topToolByPath: Map<string, { toolSlug: string; toolName: string; clicks: number }>;
}): AffiliateHubCtrRow[] {
  return input.pagePaths
    .map((pagePath) => {
      const impressions = input.impressionsByPath.get(pagePath) || 0;
      const outboundClicks = input.outboundByPath.get(pagePath) || 0;
      const topTool = input.topToolByPath.get(pagePath);

      return {
        pagePath,
        pageTitle: input.labelsByPath.get(pagePath) || pagePath,
        impressions,
        outboundClicks,
        ctr: impressions > 0 ? outboundClicks / impressions : 0,
        topToolSlug: topTool?.toolSlug || null,
        topToolName: topTool?.toolName || null,
      };
    })
    .sort((a, b) => {
      if (b.ctr !== a.ctr) {
        return b.ctr - a.ctr;
      }
      if (b.outboundClicks !== a.outboundClicks) {
        return b.outboundClicks - a.outboundClicks;
      }
      return b.impressions - a.impressions;
    });
}

function createEmptyHubVariantStats(): AffiliateHubExperimentVariantStats {
  return {
    A: { impressions: 0, outboundClicks: 0 },
    B: { impressions: 0, outboundClicks: 0 },
  };
}

function erfApprox(x: number): number {
  // Abramowitz and Stegun approximation
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * absX);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-absX * absX));
  return sign * y;
}

function normalCdf(value: number): number {
  return 0.5 * (1 + erfApprox(value / Math.sqrt(2)));
}

function twoProportionPValue(input: {
  successA: number;
  totalA: number;
  successB: number;
  totalB: number;
}): number | null {
  if (input.totalA <= 0 || input.totalB <= 0) {
    return null;
  }
  const pA = input.successA / input.totalA;
  const pB = input.successB / input.totalB;
  const pooled =
    (input.successA + input.successB) / (input.totalA + input.totalB);
  const se = Math.sqrt(
    pooled * (1 - pooled) * (1 / input.totalA + 1 / input.totalB),
  );
  if (se === 0 || Number.isNaN(se)) {
    return null;
  }
  const z = (pB - pA) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  if (!Number.isFinite(pValue)) {
    return null;
  }
  return Math.max(0, Math.min(1, pValue));
}

export function buildAffiliateHubExperimentCtrRows(input: {
  pagePaths: string[];
  labelsByPath: Map<string, string>;
  variantStatsByPath: Map<string, AffiliateHubExperimentVariantStats>;
  minImpressionsPerVariant?: number;
}): AffiliateHubExperimentCtrRow[] {
  const minImpressionsPerVariant = Math.max(
    1,
    input.minImpressionsPerVariant ?? DEFAULT_HUB_EXPERIMENT_MIN_IMPRESSIONS,
  );

  return input.pagePaths
    .map((pagePath) => {
      const stats = input.variantStatsByPath.get(pagePath) || createEmptyHubVariantStats();
      const ctrA =
        stats.A.impressions > 0
          ? stats.A.outboundClicks / stats.A.impressions
          : 0;
      const ctrB =
        stats.B.impressions > 0
          ? stats.B.outboundClicks / stats.B.impressions
          : 0;
      const liftBvsA = ctrA > 0 ? (ctrB - ctrA) / ctrA : null;
      const pValue = twoProportionPValue({
        successA: stats.A.outboundClicks,
        totalA: stats.A.impressions,
        successB: stats.B.outboundClicks,
        totalB: stats.B.impressions,
      });

      const hasEnoughTraffic =
        stats.A.impressions >= minImpressionsPerVariant &&
        stats.B.impressions >= minImpressionsPerVariant;
      const isSignificant =
        hasEnoughTraffic && pValue !== null && pValue < 0.05;
      const signal: AffiliateHubExperimentSignal = isSignificant
        ? ctrB > ctrA
          ? "B_LEADING"
          : ctrB < ctrA
            ? "A_LEADING"
            : "NO_SIGNAL"
        : "NO_SIGNAL";

      return {
        pagePath,
        pageTitle: input.labelsByPath.get(pagePath) || pagePath,
        impressionsA: stats.A.impressions,
        outboundClicksA: stats.A.outboundClicks,
        ctrA,
        impressionsB: stats.B.impressions,
        outboundClicksB: stats.B.outboundClicks,
        ctrB,
        liftBvsA,
        pValue: hasEnoughTraffic ? pValue : null,
        confidence: hasEnoughTraffic && pValue !== null ? 1 - pValue : null,
        isSignificant,
        signal,
      };
    })
    .sort((a, b) => {
      const totalA = a.impressionsA + a.impressionsB;
      const totalB = b.impressionsA + b.impressionsB;
      if (totalB !== totalA) {
        return totalB - totalA;
      }

      const liftA = Math.abs(a.liftBvsA || 0);
      const liftB = Math.abs(b.liftBvsA || 0);
      if (liftB !== liftA) {
        return liftB - liftA;
      }

      return a.pageTitle.localeCompare(b.pageTitle);
    });
}

export function getHubExperimentConclusions(
  rows: AffiliateHubExperimentCtrRow[],
  options?: {
    minAbsoluteLift?: number;
  },
): AffiliateHubExperimentConclusion[] {
  const minAbsoluteLift = Math.max(0, options?.minAbsoluteLift ?? 0.1);

  const items = rows.map((row) => {
    const lift = row.liftBvsA ?? 0;
    const absLift = Math.abs(lift);
    let decision: AffiliateHubExperimentDecision = "RUN_LONGER";
    let reason = "Need more statistically reliable traffic before changing the default.";

    if (row.isSignificant && absLift >= minAbsoluteLift) {
      if (row.signal === "B_LEADING") {
        decision = "SHIP_B";
        reason = `Variant B has significant CTR lift and exceeds the ${(minAbsoluteLift * 100).toFixed(0)}% threshold.`;
      } else if (row.signal === "A_LEADING") {
        decision = "KEEP_A";
        reason = `Variant A is significantly stronger and exceeds the ${(minAbsoluteLift * 100).toFixed(0)}% threshold.`;
      }
    } else if (row.isSignificant && absLift < minAbsoluteLift) {
      reason = `Difference is significant but below the ${(minAbsoluteLift * 100).toFixed(0)}% lift threshold.`;
    }

    return {
      pagePath: row.pagePath,
      pageTitle: row.pageTitle,
      decision,
      reason,
      liftBvsA: row.liftBvsA,
      pValue: row.pValue,
      confidence: row.confidence,
      impressionsA: row.impressionsA,
      impressionsB: row.impressionsB,
    };
  });

  const rank = (decision: AffiliateHubExperimentDecision): number => {
    if (decision === "SHIP_B") {
      return 3;
    }
    if (decision === "KEEP_A") {
      return 2;
    }
    return 1;
  };

  return items.sort((a, b) => {
    const decisionDelta = rank(b.decision) - rank(a.decision);
    if (decisionDelta !== 0) {
      return decisionDelta;
    }

    const absLiftA = Math.abs(a.liftBvsA || 0);
    const absLiftB = Math.abs(b.liftBvsA || 0);
    if (absLiftB !== absLiftA) {
      return absLiftB - absLiftA;
    }

    return a.pageTitle.localeCompare(b.pageTitle);
  });
}

export function buildAffiliateHubTrendSeries(input: {
  dayKeys: string[];
  impressionsByDay: Map<string, number>;
  outboundByDay: Map<string, number>;
}): AffiliateHubTrendPoint[] {
  return input.dayKeys.map((dayKey) => {
    const impressions = input.impressionsByDay.get(dayKey) || 0;
    const outboundClicks = input.outboundByDay.get(dayKey) || 0;

    return {
      dayKey,
      impressions,
      outboundClicks,
      ctr: impressions > 0 ? outboundClicks / impressions : 0,
    };
  });
}

export function buildAttributionDimensionRows(
  counts: Map<string, number>,
  options?: {
    limit?: number;
    labelForKey?: (key: string) => string;
  },
): AffiliateAttributionDimensionRow[] {
  const limit = Math.max(1, options?.limit ?? 8);

  return Array.from(counts.entries())
    .filter(([, clicks]) => clicks > 0)
    .map(([key, clicks]) => ({
      key,
      label: options?.labelForKey ? options.labelForKey(key) : key,
      clicks,
    }))
    .sort((a, b) => {
      if (b.clicks !== a.clicks) {
        return b.clicks - a.clicks;
      }
      return a.label.localeCompare(b.label);
    })
    .slice(0, limit);
}

export function buildHubVariantSummary(
  rows: AffiliateHubExperimentCtrRow[],
): AffiliateHubVariantSummary {
  const totals = rows.reduce(
    (acc, row) => {
      acc.impressionsA += row.impressionsA;
      acc.outboundClicksA += row.outboundClicksA;
      acc.impressionsB += row.impressionsB;
      acc.outboundClicksB += row.outboundClicksB;
      return acc;
    },
    {
      impressionsA: 0,
      outboundClicksA: 0,
      impressionsB: 0,
      outboundClicksB: 0,
    },
  );

  const ctrA =
    totals.impressionsA > 0 ? totals.outboundClicksA / totals.impressionsA : 0;
  const ctrB =
    totals.impressionsB > 0 ? totals.outboundClicksB / totals.impressionsB : 0;
  const liftBvsA = ctrA > 0 ? (ctrB - ctrA) / ctrA : null;

  return {
    impressionsA: totals.impressionsA,
    outboundClicksA: totals.outboundClicksA,
    ctrA,
    impressionsB: totals.impressionsB,
    outboundClicksB: totals.outboundClicksB,
    ctrB,
    liftBvsA,
  };
}

export function getLowHubCtrCandidates(
  rows: AffiliateHubCtrRow[],
  options?: {
    minImpressions?: number;
    maxCtr?: number;
    limit?: number;
  },
): AffiliateHubCtrRow[] {
  const minImpressions = Math.max(
    1,
    options?.minImpressions ?? DEFAULT_LOW_HUB_CTR_MIN_IMPRESSIONS,
  );
  const maxCtr = Math.max(0, options?.maxCtr ?? DEFAULT_LOW_HUB_CTR_MAX_CTR);
  const limit = Math.max(1, options?.limit ?? 5);

  return rows
    .filter((row) => row.impressions >= minImpressions && row.ctr <= maxCtr)
    .slice()
    .sort((a, b) => {
      if (a.ctr !== b.ctr) {
        return a.ctr - b.ctr;
      }
      if (b.impressions !== a.impressions) {
        return b.impressions - a.impressions;
      }
      return b.outboundClicks - a.outboundClicks;
    })
    .slice(0, limit);
}

export function parseAffiliateHubActionStatusByPath(
  lines: string[],
): Map<string, AffiliateHubActionState> {
  const statusByPath = new Map<string, AffiliateHubActionState>();

  for (const line of lines) {
    const parsed = parseAffiliateHubActionLine(line);
    if (!parsed) {
      continue;
    }

    const existing = statusByPath.get(parsed.pagePath);
    if (existing) {
      const existingMs = new Date(existing.updatedAt).getTime();
      if (Number.isFinite(existingMs) && existingMs > parsed.timestampMs) {
        continue;
      }
    }

    statusByPath.set(parsed.pagePath, {
      status: parsed.status,
      note: parsed.note,
      updatedAt: new Date(parsed.timestampMs).toISOString(),
    });
  }

  return statusByPath;
}

export function buildHubActionRowsForRecommendations(input: {
  lowCtrRows: AffiliateHubCtrRow[];
  labelsByPath: Map<string, string>;
  statusByPath?: Map<string, AffiliateHubActionState>;
}): AffiliateHubCtrRow[] {
  const rows = input.lowCtrRows.slice();
  const existingPaths = new Set(rows.map((row) => row.pagePath));

  for (const pagePath of input.statusByPath?.keys() || []) {
    if (existingPaths.has(pagePath)) {
      continue;
    }

    rows.push({
      pagePath,
      pageTitle: input.labelsByPath.get(pagePath) || pagePath,
      impressions: 0,
      outboundClicks: 0,
      ctr: 0,
      topToolSlug: null,
      topToolName: null,
    });
    existingPaths.add(pagePath);
  }

  return rows;
}

export function buildLowHubCtrActionRecommendations(input: {
  lowCtrRows: AffiliateHubCtrRow[];
  recommendedToolNamesByPath: Map<string, string[]>;
  statusByPath?: Map<string, AffiliateHubActionState>;
}): AffiliateHubActionRecommendation[] {
  return input.lowCtrRows.map((row) => {
    const suggestedToolNames = (
      input.recommendedToolNamesByPath.get(row.pagePath) || []
    )
      .filter((name) => name && name !== row.topToolName)
      .slice(0, 3);
    const isHighPriority = row.ctr <= DEFAULT_LOW_HUB_CTR_MAX_CTR / 2;
    const status = input.statusByPath?.get(row.pagePath);

    return {
      pagePath: row.pagePath,
      pageTitle: row.pageTitle,
      impressions: row.impressions,
      outboundClicks: row.outboundClicks,
      ctr: row.ctr,
      expectedLiftRange: isHighPriority ? "20%-40%" : "10%-25%",
      priority: isHighPriority ? "HIGH" : "MEDIUM",
      executionStatus: status?.status || "TODO",
      executionNote: status?.note,
      executionUpdatedAt: status?.updatedAt,
      recommendation: isHighPriority
        ? "Replace hero card order and primary CTA copy, then rerun A/B validation for 7 days."
        : "Test a new top-3 ordering and stronger CTA language while keeping disclosure placement unchanged.",
      suggestedToolNames,
    };
  });
}

function toTimestampForSort(value: string | undefined): number {
  if (!value) {
    return -1;
  }
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : -1;
}

export function filterAndSortHubActionRecommendations(
  items: AffiliateHubActionRecommendation[],
  options?: {
    status?: AffiliateHubActionStatusFilter;
    sortBy?: AffiliateHubActionSortKey;
  },
): AffiliateHubActionRecommendation[] {
  const status = options?.status || "ALL";
  const sortBy = options?.sortBy || "UPDATED_DESC";

  const filtered = items.filter((item) => {
    if (status === "ALL") {
      return true;
    }
    if (status === "UNVERIFIED") {
      return item.executionStatus === "TODO" || item.executionStatus === "TESTING";
    }
    return item.executionStatus === status;
  });

  return filtered.slice().sort((a, b) => {
    const aMs = toTimestampForSort(a.executionUpdatedAt);
    const bMs = toTimestampForSort(b.executionUpdatedAt);
    if (sortBy === "UPDATED_ASC") {
      if (aMs !== bMs) {
        if (aMs < 0) {
          return 1;
        }
        if (bMs < 0) {
          return -1;
        }
        return aMs - bMs;
      }
    } else if (aMs !== bMs) {
      if (aMs < 0) {
        return 1;
      }
      if (bMs < 0) {
        return -1;
      }
      return bMs - aMs;
    }

    const priorityScore = (value: "HIGH" | "MEDIUM"): number =>
      value === "HIGH" ? 2 : 1;
    const priorityDelta = priorityScore(b.priority) - priorityScore(a.priority);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    if (b.impressions !== a.impressions) {
      return b.impressions - a.impressions;
    }
    return a.pageTitle.localeCompare(b.pageTitle);
  });
}

export function getHubActionStatusCounts(
  items: AffiliateHubActionRecommendation[],
): AffiliateHubActionStatusCounts {
  const counts: AffiliateHubActionStatusCounts = {
    ALL: items.length,
    TODO: 0,
    TESTING: 0,
    VERIFIED: 0,
    DISMISSED: 0,
    UNVERIFIED: 0,
  };

  for (const item of items) {
    counts[item.executionStatus] += 1;
    if (item.executionStatus === "TODO" || item.executionStatus === "TESTING") {
      counts.UNVERIFIED += 1;
    }
  }

  return counts;
}

export async function auditAffiliateManualMetric(input: {
  toolSlug: string;
  kind: AffiliateManualMetricKind;
  count: number;
  note?: string;
}): Promise<void> {
  const line = buildAffiliateManualMetricLine({
    timestamp: new Date().toISOString(),
    toolSlug: input.toolSlug,
    kind: input.kind,
    count: input.count,
    note: input.note,
  });

  try {
    await fs.appendFile(getAuditLogPath(), `${line}\n`, "utf8");
  } catch {
    // Intentionally non-blocking.
  }
}

export async function auditAffiliateHubActionStatus(input: {
  pagePath: string;
  status: AffiliateHubActionStatus;
  note?: string;
}): Promise<void> {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    scope: "affiliate_hub_action",
    pagePath: input.pagePath.trim(),
    status: input.status,
    note: input.note?.trim() || undefined,
  });

  try {
    await fs.appendFile(getAuditLogPath(), `${line}\n`, "utf8");
  } catch {
    // Intentionally non-blocking.
  }
}

export async function deleteAffiliateManualMetricById(
  entryId: string,
): Promise<boolean> {
  const targetId = entryId.trim();
  if (!targetId) {
    return false;
  }

  let lines: string[] = [];
  try {
    const content = await fs.readFile(getAuditLogPath(), "utf8");
    lines = content.split(/\r?\n/);
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }
  } catch {
    return false;
  }

  const removed = removeAffiliateManualMetricByIdFromLines(lines, targetId);
  if (!removed.removed || !removed.removedEntry) {
    return false;
  }

  const nextContent =
    removed.linesAfter.length > 0 ? `${removed.linesAfter.join("\n")}\n` : "";
  try {
    await fs.writeFile(getAuditLogPath(), nextContent, "utf8");
    const auditEntry = {
      timestamp: new Date().toISOString(),
      scope: "affiliate_performance_audit",
      action: "DELETE_MANUAL_METRIC",
      targetEntryId: targetId,
      removed: {
        timestamp: removed.removedEntry.timestamp,
        toolSlug: removed.removedEntry.toolSlug,
        kind: removed.removedEntry.kind,
        count: removed.removedEntry.count,
        note: removed.removedEntry.note,
      },
    };
    await fs.appendFile(getAuditLogPath(), `${JSON.stringify(auditEntry)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function correctAffiliateManualMetricById(
  entryId: string,
  input: {
    toolSlug: string;
    kind: AffiliateManualMetricKind;
    count: number;
    note?: string;
  },
): Promise<boolean> {
  const targetId = entryId.trim();
  if (!targetId) {
    return false;
  }

  let lines: string[] = [];
  try {
    const content = await fs.readFile(getAuditLogPath(), "utf8");
    lines = content.split(/\r?\n/);
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }
  } catch {
    return false;
  }

  const replaced = replaceAffiliateManualMetricByIdFromLines(lines, targetId, input);
  if (!replaced.replaced || !replaced.oldEntry || !replaced.newEntry) {
    return false;
  }

  const nextContent =
    replaced.linesAfter.length > 0 ? `${replaced.linesAfter.join("\n")}\n` : "";
  try {
    await fs.writeFile(getAuditLogPath(), nextContent, "utf8");
    const auditEntry = {
      timestamp: new Date().toISOString(),
      scope: "affiliate_performance_audit",
      action: "CORRECT_MANUAL_METRIC",
      targetEntryId: targetId,
      from: {
        timestamp: replaced.oldEntry.timestamp,
        toolSlug: replaced.oldEntry.toolSlug,
        kind: replaced.oldEntry.kind,
        count: replaced.oldEntry.count,
        note: replaced.oldEntry.note,
      },
      to: {
        timestamp: replaced.newEntry.timestamp,
        toolSlug: replaced.newEntry.toolSlug,
        kind: replaced.newEntry.kind,
        count: replaced.newEntry.count,
        note: replaced.newEntry.note,
      },
    };
    await fs.appendFile(getAuditLogPath(), `${JSON.stringify(auditEntry)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

function buildRows(input: {
  toolOptions: Array<{ id?: string; slug: string; name: string; hasPrimaryLink: boolean }>;
  clickCountsByToolId: Map<string, { affiliateClicks: number; outboundClicks: number }>;
  manualImpressions: Map<string, number>;
  manualConversions: Map<string, number>;
}): AffiliateToolPerformanceRow[] {
  const rows = input.toolOptions.map((tool) => {
    const clickCounts = tool.id ? input.clickCountsByToolId.get(tool.id) : undefined;
    const affiliateClicks = clickCounts?.affiliateClicks || 0;
    const outboundDirect = clickCounts?.outboundClicks || 0;
    const outboundClicks = affiliateClicks + outboundDirect;
    const impressions = input.manualImpressions.get(tool.slug) || 0;
    const conversions = input.manualConversions.get(tool.slug) || 0;
    const conversionRate = outboundClicks > 0 ? conversions / outboundClicks : 0;

    return {
      toolSlug: tool.slug,
      toolName: tool.name,
      impressions,
      affiliateClicks,
      outboundClicks,
      conversions,
      conversionRate,
      hasPrimaryLink: tool.hasPrimaryLink,
    };
  });

  rows.sort((a, b) => {
    if (b.outboundClicks !== a.outboundClicks) {
      return b.outboundClicks - a.outboundClicks;
    }
    if (b.conversions !== a.conversions) {
      return b.conversions - a.conversions;
    }
    return b.impressions - a.impressions;
  });

  return rows;
}

function buildTotals(rows: AffiliateToolPerformanceRow[]) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.impressions += row.impressions;
      acc.affiliateClicks += row.affiliateClicks;
      acc.outboundClicks += row.outboundClicks;
      acc.conversions += row.conversions;
      return acc;
    },
    {
      impressions: 0,
      affiliateClicks: 0,
      outboundClicks: 0,
      conversions: 0,
      conversionRate: 0,
    },
  );
  totals.conversionRate =
    totals.outboundClicks > 0 ? totals.conversions / totals.outboundClicks : 0;

  return totals;
}

export async function getAffiliatePerformanceData(options?: {
  windowDays?: number;
  trendToolSlug?: string;
  hubPath?: string;
  historyPage?: number;
  historyPerPage?: number;
  historyToolSlug?: string;
  historyKind?: AffiliateManualMetricKind;
  minHubExperimentImpressionsPerVariant?: number;
  minHubExperimentAbsoluteLift?: number;
}): Promise<AffiliatePerformanceData> {
  const windowDays = Math.min(90, Math.max(1, options?.windowDays ?? 7));
  const windowMs = windowDays * DAY_MS;
  const nowMs = Date.now();
  const dayKeys = getRecentDayKeys(windowDays, nowMs);
  const dayKeySet = new Set(dayKeys);
  const editorialHubPaths = getEditorialHubPaths();
  const editorialHubLabels = new Map(
    editorialHubPaths.map((pagePath) => [
      pagePath,
      getEditorialHubConfig(pagePath)?.title || pagePath,
    ]),
  );
  const fallbackToolNameBySlug = new Map(
    getFallbackToolProfiles().map((tool) => [tool.slug, tool.name]),
  );
  const recommendedToolNamesByPath = new Map(
    editorialHubPaths.map((pagePath) => {
      const config = getEditorialHubConfig(pagePath);
      const names =
        config?.recommendations
          .map((item) => fallbackToolNameBySlug.get(item.slug) || item.slug)
          .slice(0, 5) || [];
      return [pagePath, names];
    }),
  );
  const requestedHubPath = options?.hubPath?.trim() || "";
  const hubTrendPath = editorialHubPaths.includes(requestedHubPath)
    ? requestedHubPath
    : null;
  const requestedTrendToolSlug = options?.trendToolSlug?.trim() || "";

  let lines: string[] = [];
  try {
    const content = await fs.readFile(getAuditLogPath(), "utf8");
    lines = content.split(/\r?\n/).slice(-20000);
  } catch {
    lines = [];
  }

  const manual = parseAffiliateManualMetricEntries(lines, { nowMs, windowMs });
  const hubActionStatusByPath = parseAffiliateHubActionStatusByPath(lines);
  const manualHistory = parseAffiliateManualMetricHistory(lines, {
    nowMs,
    windowMs,
    page: options?.historyPage,
    perPage: options?.historyPerPage,
    toolSlug: options?.historyToolSlug,
    kind: options?.historyKind,
  });
  const experimentThresholds = resolveExperimentThresholds({
    overrideMinImpressionsPerVariant:
      options?.minHubExperimentImpressionsPerVariant,
    overrideMinAbsoluteLift: options?.minHubExperimentAbsoluteLift,
  });

  try {
    const db = getDb();
    const since = new Date(nowMs - windowMs);
    const hubTrendPaths = hubTrendPath ? [hubTrendPath] : editorialHubPaths;
    const [tools, grouped, hubImpressionGrouped, hubOutboundGrouped, hubOutboundToolGrouped, hubEditorialEvents] =
      await Promise.all([
      db.tool.findMany({
        where: { status: ToolStatus.ACTIVE },
        orderBy: { updatedAt: "desc" },
        take: 300,
        select: {
          id: true,
          slug: true,
          name: true,
          affiliateLinks: {
            where: { isPrimary: true },
            select: { id: true },
            take: 1,
          },
        },
      }),
      db.clickEvent.groupBy({
        by: ["toolId", "eventType"],
        where: {
          createdAt: { gte: since },
          toolId: { not: null },
        },
        _count: { _all: true },
      }),
      db.clickEvent.groupBy({
        by: ["pagePath"],
        where: {
          createdAt: { gte: since },
          eventType: EventType.OUTBOUND_CLICK,
          toolId: null,
          pagePath: { in: editorialHubPaths },
        },
        _count: { _all: true },
      }),
      db.clickEvent.groupBy({
        by: ["pagePath"],
        where: {
          createdAt: { gte: since },
          eventType: { in: [EventType.AFFILIATE_CLICK, EventType.OUTBOUND_CLICK] },
          toolId: { not: null },
          pagePath: { in: editorialHubPaths },
        },
        _count: { _all: true },
      }),
      db.clickEvent.groupBy({
        by: ["pagePath", "toolId"],
        where: {
          createdAt: { gte: since },
          eventType: { in: [EventType.AFFILIATE_CLICK, EventType.OUTBOUND_CLICK] },
          toolId: { not: null },
          pagePath: { in: editorialHubPaths },
        },
        _count: { _all: true },
      }),
      db.clickEvent.findMany({
        where: {
          createdAt: { gte: since },
          pagePath: { in: editorialHubPaths },
          eventType: { in: [EventType.AFFILIATE_CLICK, EventType.OUTBOUND_CLICK] },
        },
        select: {
          pagePath: true,
          toolId: true,
          eventType: true,
          createdAt: true,
          metadata: true,
        },
      }),
    ]);

    const clickCountsByToolId = new Map<
      string,
      { affiliateClicks: number; outboundClicks: number }
    >();
    for (const item of grouped) {
      if (!item.toolId) {
        continue;
      }

      const existing = clickCountsByToolId.get(item.toolId) || {
        affiliateClicks: 0,
        outboundClicks: 0,
      };

      if (item.eventType === EventType.AFFILIATE_CLICK) {
        existing.affiliateClicks += item._count._all;
      } else if (item.eventType === EventType.OUTBOUND_CLICK) {
        existing.outboundClicks += item._count._all;
      }

      clickCountsByToolId.set(item.toolId, existing);
    }

    const toolOptions = tools.map((tool) => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      hasPrimaryLink: tool.affiliateLinks.length > 0,
    }));
    const toolById = new Map(tools.map((tool) => [tool.id, { slug: tool.slug, name: tool.name }]));

    const hubImpressionsByPath = new Map<string, number>();
    for (const item of hubImpressionGrouped) {
      hubImpressionsByPath.set(item.pagePath, item._count._all);
    }

    const hubOutboundByPath = new Map<string, number>();
    for (const item of hubOutboundGrouped) {
      hubOutboundByPath.set(item.pagePath, item._count._all);
    }

    const topToolByPath = new Map<
      string,
      { toolSlug: string; toolName: string; clicks: number }
    >();
    for (const item of hubOutboundToolGrouped) {
      if (!item.toolId) {
        continue;
      }

      const tool = toolById.get(item.toolId);
      if (!tool) {
        continue;
      }

      const existing = topToolByPath.get(item.pagePath);
      if (!existing || item._count._all > existing.clicks) {
        topToolByPath.set(item.pagePath, {
          toolSlug: tool.slug,
          toolName: tool.name,
          clicks: item._count._all,
        });
      }
    }

    const hubCtrRows = buildAffiliateHubCtrRows({
      pagePaths: editorialHubPaths,
      labelsByPath: editorialHubLabels,
      impressionsByPath: hubImpressionsByPath,
      outboundByPath: hubOutboundByPath,
      topToolByPath,
    });
    const hubExperimentStatsByPath = new Map<
      string,
      AffiliateHubExperimentVariantStats
    >();
    for (const event of hubEditorialEvents) {
      const variant = parseHubEventVariantFromMetadata(event.metadata);
      const current =
        hubExperimentStatsByPath.get(event.pagePath) || createEmptyHubVariantStats();

      if (event.toolId) {
        current[variant].outboundClicks += 1;
        hubExperimentStatsByPath.set(event.pagePath, current);
        continue;
      }

      if (
        event.eventType === EventType.OUTBOUND_CLICK &&
        isHubImpressionEventMetadata(event.metadata)
      ) {
        current[variant].impressions += 1;
        hubExperimentStatsByPath.set(event.pagePath, current);
      }
    }
    const hubExperimentRows = buildAffiliateHubExperimentCtrRows({
      pagePaths: editorialHubPaths,
      labelsByPath: editorialHubLabels,
      variantStatsByPath: hubExperimentStatsByPath,
      minImpressionsPerVariant: experimentThresholds.minImpressionsPerVariant,
    });
    const hubExperimentConclusions = getHubExperimentConclusions(
      hubExperimentRows,
      {
        minAbsoluteLift: experimentThresholds.minAbsoluteLift,
      },
    );
    const lowHubCtrCandidates = getLowHubCtrCandidates(hubCtrRows);
    const hubActionRows = buildHubActionRowsForRecommendations({
      lowCtrRows: lowHubCtrCandidates,
      labelsByPath: editorialHubLabels,
      statusByPath: hubActionStatusByPath,
    });
    const hubActionRecommendations = buildLowHubCtrActionRecommendations({
      lowCtrRows: hubActionRows,
      recommendedToolNamesByPath,
      statusByPath: hubActionStatusByPath,
    });

    const hubImpressionsByDay = new Map<string, number>();
    const hubOutboundByDay = new Map<string, number>();
    const hubTrendPathSet = new Set(hubTrendPaths);
    for (const event of hubEditorialEvents) {
      if (!hubTrendPathSet.has(event.pagePath)) {
        continue;
      }

      const dayKey = toDayKey(event.createdAt.getTime());
      if (!dayKeySet.has(dayKey)) {
        continue;
      }

      if (event.toolId) {
        hubOutboundByDay.set(dayKey, (hubOutboundByDay.get(dayKey) || 0) + 1);
      } else if (
        event.eventType === EventType.OUTBOUND_CLICK &&
        isHubImpressionEventMetadata(event.metadata)
      ) {
        hubImpressionsByDay.set(dayKey, (hubImpressionsByDay.get(dayKey) || 0) + 1);
      }
    }
    const hubTrend = buildAffiliateHubTrendSeries({
      dayKeys,
      impressionsByDay: hubImpressionsByDay,
      outboundByDay: hubOutboundByDay,
    });

    const selectedTrendTool = requestedTrendToolSlug
      ? toolOptions.find((tool) => tool.slug === requestedTrendToolSlug) || null
      : null;
    const trendToolSlug = selectedTrendTool?.slug || null;
    const trendToolId = selectedTrendTool?.id || null;

    const clickEvents = await db.clickEvent.findMany({
      where: {
        createdAt: { gte: since },
        eventType: { in: [EventType.AFFILIATE_CLICK, EventType.OUTBOUND_CLICK] },
        toolId: trendToolId ? trendToolId : { not: null },
      },
      select: {
        eventType: true,
        createdAt: true,
        countryCode: true,
        metadata: true,
      },
    });

    const outboundClicksByDay = new Map<string, number>();
    const outboundByCountryCount = new Map<string, number>();
    const outboundByPlacementCount = new Map<string, number>();
    const outboundByLinkKindCount = new Map<string, number>();
    for (const event of clickEvents) {
      const dayKey = toDayKey(event.createdAt.getTime());
      if (!dayKeySet.has(dayKey)) {
        continue;
      }
      outboundClicksByDay.set(dayKey, (outboundClicksByDay.get(dayKey) || 0) + 1);

      const countryKey = parseCountryCodeFromMetadata(
        event.metadata,
        event.countryCode,
      );
      outboundByCountryCount.set(
        countryKey,
        (outboundByCountryCount.get(countryKey) || 0) + 1,
      );

      const placementKey = parsePlacementFromMetadata(event.metadata);
      outboundByPlacementCount.set(
        placementKey,
        (outboundByPlacementCount.get(placementKey) || 0) + 1,
      );

      let linkKindKey = parseLinkKindFromMetadata(event.metadata);
      if (linkKindKey === "UNSPECIFIED") {
        linkKindKey =
          event.eventType === EventType.AFFILIATE_CLICK ? "AFFILIATE" : "DIRECT";
      }
      outboundByLinkKindCount.set(
        linkKindKey,
        (outboundByLinkKindCount.get(linkKindKey) || 0) + 1,
      );
    }

    const conversionDaily = parseAffiliateManualConversionDailySeries(lines, {
      nowMs,
      windowMs,
      toolSlug: trendToolSlug || undefined,
    });
    const rows = buildRows({
      toolOptions,
      clickCountsByToolId,
      manualImpressions: manual.impressionsByTool,
      manualConversions: manual.conversionsByTool,
    });
    const trend = buildAffiliateTrendSeries({
      dayKeys,
      outboundClicksByDay,
      conversionsByDay: conversionDaily,
    });
    const outboundByCountry = buildAttributionDimensionRows(outboundByCountryCount, {
      labelForKey: (key) => (key === "UNSPECIFIED" ? "Unspecified" : key),
    });
    const outboundByPlacement = buildAttributionDimensionRows(
      outboundByPlacementCount,
      {
        labelForKey: (key) =>
          key === "unspecified" ? "Unspecified placement" : key,
      },
    );
    const outboundByLinkKind = buildAttributionDimensionRows(
      outboundByLinkKindCount,
      {
        labelForKey: (key) => key,
      },
    );
    const hubVariantSummary = buildHubVariantSummary(hubExperimentRows);
    const topConverters = getTopConverters(rows);
    const lowCvrCandidates = getLowCvrCandidates(rows);

    return {
      dbAvailable: true,
      windowDays,
      toolOptions: toolOptions.map((item) => ({
        slug: item.slug,
        name: item.name,
      })),
      hubOptions: editorialHubPaths.map((pagePath) => ({
        path: pagePath,
        title: editorialHubLabels.get(pagePath) || pagePath,
      })),
      trendToolSlug,
      hubTrendPath,
      totals: buildTotals(rows),
      trend,
      hubCtrRows,
      hubExperimentRows,
      hubVariantSummary,
      hubExperimentConclusions,
      hubTrend,
      outboundByCountry,
      outboundByPlacement,
      outboundByLinkKind,
      experimentThresholds,
      lowHubCtrCandidates,
      hubActionRecommendations,
      topConverters,
      lowCvrCandidates,
      manualHistory,
      rows,
    };
  } catch {
    const fallback = getFallbackToolProfiles().map((tool) => ({
      slug: tool.slug,
      name: tool.name,
      hasPrimaryLink: true,
    }));
    const rows = buildRows({
      toolOptions: fallback,
      clickCountsByToolId: new Map(),
      manualImpressions: manual.impressionsByTool,
      manualConversions: manual.conversionsByTool,
    });
    const selectedTrendTool = requestedTrendToolSlug
      ? fallback.find((tool) => tool.slug === requestedTrendToolSlug) || null
      : null;
    const trendToolSlug = selectedTrendTool?.slug || null;
    const trend = buildAffiliateTrendSeries({
      dayKeys,
      outboundClicksByDay: new Map(),
      conversionsByDay: parseAffiliateManualConversionDailySeries(lines, {
        nowMs,
        windowMs,
        toolSlug: trendToolSlug || undefined,
      }),
    });
    const hubCtrRows = buildAffiliateHubCtrRows({
      pagePaths: editorialHubPaths,
      labelsByPath: editorialHubLabels,
      impressionsByPath: new Map(),
      outboundByPath: new Map(),
      topToolByPath: new Map(),
    });
    const hubExperimentRows = buildAffiliateHubExperimentCtrRows({
      pagePaths: editorialHubPaths,
      labelsByPath: editorialHubLabels,
      variantStatsByPath: new Map(),
      minImpressionsPerVariant: experimentThresholds.minImpressionsPerVariant,
    });
    const hubExperimentConclusions = getHubExperimentConclusions(
      hubExperimentRows,
      {
        minAbsoluteLift: experimentThresholds.minAbsoluteLift,
      },
    );
    const hubVariantSummary = buildHubVariantSummary(hubExperimentRows);
    const lowHubCtrCandidates = getLowHubCtrCandidates(hubCtrRows);
    const hubActionRows = buildHubActionRowsForRecommendations({
      lowCtrRows: lowHubCtrCandidates,
      labelsByPath: editorialHubLabels,
      statusByPath: hubActionStatusByPath,
    });
    const hubActionRecommendations = buildLowHubCtrActionRecommendations({
      lowCtrRows: hubActionRows,
      recommendedToolNamesByPath,
      statusByPath: hubActionStatusByPath,
    });
    const hubTrend = buildAffiliateHubTrendSeries({
      dayKeys,
      impressionsByDay: new Map(),
      outboundByDay: new Map(),
    });
    const topConverters = getTopConverters(rows);
    const lowCvrCandidates = getLowCvrCandidates(rows);

    return {
      dbAvailable: false,
      windowDays,
      toolOptions: fallback.map((item) => ({
        slug: item.slug,
        name: item.name,
      })),
      hubOptions: editorialHubPaths.map((pagePath) => ({
        path: pagePath,
        title: editorialHubLabels.get(pagePath) || pagePath,
      })),
      trendToolSlug,
      hubTrendPath,
      totals: buildTotals(rows),
      trend,
      hubCtrRows,
      hubExperimentRows,
      hubVariantSummary,
      hubExperimentConclusions,
      hubTrend,
      outboundByCountry: [],
      outboundByPlacement: [],
      outboundByLinkKind: [],
      experimentThresholds,
      lowHubCtrCandidates,
      hubActionRecommendations,
      topConverters,
      lowCvrCandidates,
      manualHistory,
      rows,
    };
  }
}
