import { describe, expect, it } from "vitest";
import {
  buildAffiliateHubCtrRows,
  buildAffiliateHubExperimentCtrRows,
  buildHubActionRowsForRecommendations,
  buildLowHubCtrActionRecommendations,
  buildAffiliateHubTrendSeries,
  buildAffiliateTrendSeries,
  filterAndSortHubActionRecommendations,
  getHubExperimentConclusions,
  getHubActionStatusCounts,
  getLowHubCtrCandidates,
  getLowCvrCandidates,
  getTopConverters,
  parseAffiliateHubActionStatusByPath,
  parseAffiliateManualConversionDailySeries,
  removeAffiliateManualMetricByIdFromLines,
  replaceAffiliateManualMetricByIdFromLines,
  parseAffiliateManualMetricHistory,
  parseAffiliateManualMetricEntries,
  type AffiliateToolPerformanceRow,
} from "../../lib/affiliate-performance";

describe("affiliate performance manual metric parser", () => {
  it("aggregates impressions and conversions by tool within window", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "IMPRESSION",
        toolSlug: "zapier-ai",
        count: 12,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:51:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 2,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T10:00:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "n8n",
        count: 1,
      }),
      JSON.stringify({
        timestamp: "2026-03-07T11:51:00.000Z",
        scope: "affiliate_performance",
        kind: "IMPRESSION",
        toolSlug: "zapier-ai",
        count: 100,
      }),
    ];

    const parsed = parseAffiliateManualMetricEntries(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
    });

    expect(parsed.impressionsByTool.get("zapier-ai")).toBe(12);
    expect(parsed.conversionsByTool.get("zapier-ai")).toBe(2);
    expect(parsed.conversionsByTool.get("n8n")).toBe(1);
    expect(parsed.impressionsByTool.get("n8n") || 0).toBe(0);
  });

  it("ignores malformed lines and unknown kinds", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      "invalid",
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "other",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 1,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "UNKNOWN",
        toolSlug: "zapier-ai",
        count: 1,
      }),
    ];

    const parsed = parseAffiliateManualMetricEntries(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
    });

    expect(parsed.impressionsByTool.size).toBe(0);
    expect(parsed.conversionsByTool.size).toBe(0);
  });

  it("builds manual conversion daily series for a selected tool", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 3,
      }),
      JSON.stringify({
        timestamp: "2026-03-09T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 1,
      }),
      JSON.stringify({
        timestamp: "2026-03-09T10:00:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "n8n",
        count: 2,
      }),
    ];

    const daily = parseAffiliateManualConversionDailySeries(lines, {
      nowMs: now,
      windowMs: 2 * 24 * 60 * 60 * 1000,
      toolSlug: "zapier-ai",
    });

    expect(daily.get("2026-03-10")).toBe(3);
    expect(daily.get("2026-03-09")).toBe(1);
    expect(daily.get("2026-03-08") || 0).toBe(0);
  });

  it("builds trend series from outbound and conversion maps", () => {
    const trend = buildAffiliateTrendSeries({
      dayKeys: ["2026-03-08", "2026-03-09", "2026-03-10"],
      outboundClicksByDay: new Map([
        ["2026-03-09", 10],
        ["2026-03-10", 5],
      ]),
      conversionsByDay: new Map([
        ["2026-03-08", 1],
        ["2026-03-10", 2],
      ]),
    });

    expect(trend).toEqual([
      { dayKey: "2026-03-08", outboundClicks: 0, conversions: 1, conversionRate: 0 },
      {
        dayKey: "2026-03-09",
        outboundClicks: 10,
        conversions: 0,
        conversionRate: 0,
      },
      {
        dayKey: "2026-03-10",
        outboundClicks: 5,
        conversions: 2,
        conversionRate: 0.4,
      },
    ]);
  });

  it("ranks top converters and low cvr candidates", () => {
    const rows: AffiliateToolPerformanceRow[] = [
      {
        toolSlug: "zapier-ai",
        toolName: "Zapier AI",
        impressions: 100,
        affiliateClicks: 30,
        outboundClicks: 60,
        conversions: 6,
        conversionRate: 0.1,
        hasPrimaryLink: true,
      },
      {
        toolSlug: "n8n",
        toolName: "n8n",
        impressions: 100,
        affiliateClicks: 20,
        outboundClicks: 50,
        conversions: 1,
        conversionRate: 0.02,
        hasPrimaryLink: true,
      },
      {
        toolSlug: "make",
        toolName: "Make",
        impressions: 100,
        affiliateClicks: 20,
        outboundClicks: 45,
        conversions: 0,
        conversionRate: 0,
        hasPrimaryLink: true,
      },
      {
        toolSlug: "tiny",
        toolName: "Tiny",
        impressions: 10,
        affiliateClicks: 2,
        outboundClicks: 3,
        conversions: 0,
        conversionRate: 0,
        hasPrimaryLink: true,
      },
    ];

    const top = getTopConverters(rows, 2);
    const low = getLowCvrCandidates(rows, {
      limit: 3,
      minOutboundClicks: 20,
      maxConversionRate: 0.025,
    });

    expect(top.map((item) => item.toolSlug)).toEqual(["zapier-ai", "n8n"]);
    expect(low.map((item) => item.toolSlug)).toEqual(["n8n", "make"]);
  });

  it("returns paginated manual backfill history with filters", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 3,
        note: "batch-3",
      }),
      JSON.stringify({
        timestamp: "2026-03-10T10:50:00.000Z",
        scope: "affiliate_performance",
        kind: "IMPRESSION",
        toolSlug: "zapier-ai",
        count: 9,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T09:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "n8n",
        count: 2,
      }),
      JSON.stringify({
        timestamp: "2026-03-08T09:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "n8n",
        count: 4,
      }),
    ];

    const page1 = parseAffiliateManualMetricHistory(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
      page: 1,
      perPage: 2,
    });
    expect(page1.total).toBe(3);
    expect(page1.items).toHaveLength(2);
    expect(page1.items[0]?.toolSlug).toBe("zapier-ai");
    expect(page1.items[0]?.kind).toBe("CONVERSION");

    const filtered = parseAffiliateManualMetricHistory(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
      page: 1,
      perPage: 10,
      toolSlug: "n8n",
      kind: "CONVERSION",
    });
    expect(filtered.total).toBe(1);
    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0]?.toolSlug).toBe("n8n");
    expect(filtered.items[0]?.kind).toBe("CONVERSION");
  });

  it("removes a manual backfill entry by history id", () => {
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 3,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T10:50:00.000Z",
        scope: "affiliate_performance",
        kind: "IMPRESSION",
        toolSlug: "zapier-ai",
        count: 9,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T09:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "n8n",
        count: 2,
      }),
    ];

    const history = parseAffiliateManualMetricHistory(lines, {
      nowMs: new Date("2026-03-10T12:00:00.000Z").getTime(),
      windowMs: 24 * 60 * 60 * 1000,
      page: 1,
      perPage: 10,
    });
    const targetId = history.items.find((item) => item.toolSlug === "n8n")?.id || "";

    const removed = removeAffiliateManualMetricByIdFromLines(lines, targetId);
    expect(removed.removed).toBe(true);
    expect(removed.linesAfter).toHaveLength(2);
    expect(
      removed.linesAfter.some((line) => line.includes('"toolSlug":"n8n"')),
    ).toBe(false);
  });

  it("replaces a manual backfill entry by history id", () => {
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_performance",
        kind: "CONVERSION",
        toolSlug: "zapier-ai",
        count: 3,
        note: "old-note",
      }),
      JSON.stringify({
        timestamp: "2026-03-10T10:50:00.000Z",
        scope: "affiliate_performance",
        kind: "IMPRESSION",
        toolSlug: "zapier-ai",
        count: 9,
      }),
    ];

    const history = parseAffiliateManualMetricHistory(lines, {
      nowMs: new Date("2026-03-10T12:00:00.000Z").getTime(),
      windowMs: 24 * 60 * 60 * 1000,
      page: 1,
      perPage: 10,
    });
    const targetId = history.items.find((item) => item.kind === "CONVERSION")?.id || "";

    const replaced = replaceAffiliateManualMetricByIdFromLines(lines, targetId, {
      toolSlug: "zapier-ai",
      kind: "CONVERSION",
      count: 7,
      note: "fixed-note",
    });
    expect(replaced.replaced).toBe(true);
    expect(replaced.linesAfter).toHaveLength(2);
    expect(
      replaced.linesAfter.some((line) => line.includes('"count":7')),
    ).toBe(true);
    expect(
      replaced.linesAfter.some((line) => line.includes('"note":"fixed-note"')),
    ).toBe(true);
  });

  it("builds editorial hub ctr rows from impression and outbound counts", () => {
    const rows = buildAffiliateHubCtrRows({
      pagePaths: [
        "/best-ai-automation-tools",
        "/best-ai-agents-for-sales",
      ],
      labelsByPath: new Map([
        ["/best-ai-automation-tools", "Best AI Automation Tools for Ops Teams"],
        ["/best-ai-agents-for-sales", "Best AI Agents for Sales Teams"],
      ]),
      impressionsByPath: new Map([
        ["/best-ai-automation-tools", 100],
        ["/best-ai-agents-for-sales", 40],
      ]),
      outboundByPath: new Map([
        ["/best-ai-automation-tools", 18],
        ["/best-ai-agents-for-sales", 12],
      ]),
      topToolByPath: new Map([
        [
          "/best-ai-automation-tools",
          { toolSlug: "zapier-ai", toolName: "Zapier AI", clicks: 9 },
        ],
      ]),
    });

    expect(rows[0]).toMatchObject({
      pagePath: "/best-ai-agents-for-sales",
      impressions: 40,
      outboundClicks: 12,
      topToolSlug: null,
      topToolName: null,
    });
    expect(rows[0]?.ctr).toBeCloseTo(0.3, 6);
    expect(rows[1]).toMatchObject({
      pagePath: "/best-ai-automation-tools",
      impressions: 100,
      outboundClicks: 18,
      topToolSlug: "zapier-ai",
      topToolName: "Zapier AI",
    });
    expect(rows[1]?.ctr).toBeCloseTo(0.18, 6);
  });

  it("builds hub trend series and low ctr candidates", () => {
    const trend = buildAffiliateHubTrendSeries({
      dayKeys: ["2026-03-08", "2026-03-09", "2026-03-10"],
      impressionsByDay: new Map([
        ["2026-03-09", 10],
        ["2026-03-10", 20],
      ]),
      outboundByDay: new Map([
        ["2026-03-09", 1],
        ["2026-03-10", 3],
      ]),
    });

    expect(trend).toEqual([
      { dayKey: "2026-03-08", impressions: 0, outboundClicks: 0, ctr: 0 },
      { dayKey: "2026-03-09", impressions: 10, outboundClicks: 1, ctr: 0.1 },
      { dayKey: "2026-03-10", impressions: 20, outboundClicks: 3, ctr: 0.15 },
    ]);

    const low = getLowHubCtrCandidates([
      {
        pagePath: "/best-ai-automation-tools",
        pageTitle: "Best AI Automation Tools for Ops Teams",
        impressions: 80,
        outboundClicks: 4,
        ctr: 0.05,
        topToolSlug: "zapier-ai",
        topToolName: "Zapier AI",
      },
      {
        pagePath: "/best-ai-tools-for-support",
        pageTitle: "Best AI Tools for Customer Support",
        impressions: 120,
        outboundClicks: 36,
        ctr: 0.3,
        topToolSlug: "lindy",
        topToolName: "Lindy",
      },
      {
        pagePath: "/best-ai-tools-for-marketing",
        pageTitle: "Best AI Tools for Marketing Teams",
        impressions: 30,
        outboundClicks: 2,
        ctr: 0.0666,
        topToolSlug: "make",
        topToolName: "Make",
      },
    ]);

    expect(low.map((row) => row.pagePath)).toEqual([
      "/best-ai-automation-tools",
      "/best-ai-tools-for-marketing",
    ]);
  });

  it("builds hub experiment ctr rows with lift, significance and signal", () => {
    const rows = buildAffiliateHubExperimentCtrRows({
      pagePaths: [
        "/best-ai-automation-tools",
        "/best-ai-tools-for-support",
        "/best-ai-tools-for-marketing",
      ],
      labelsByPath: new Map([
        ["/best-ai-automation-tools", "Best AI Automation Tools for Ops Teams"],
        ["/best-ai-tools-for-support", "Best AI Tools for Customer Support"],
        ["/best-ai-tools-for-marketing", "Best AI Tools for Marketing Teams"],
      ]),
      variantStatsByPath: new Map([
        [
          "/best-ai-automation-tools",
          {
            A: { impressions: 100, outboundClicks: 10 },
            B: { impressions: 100, outboundClicks: 30 },
          },
        ],
        [
          "/best-ai-tools-for-support",
          {
            A: { impressions: 100, outboundClicks: 30 },
            B: { impressions: 100, outboundClicks: 10 },
          },
        ],
        [
          "/best-ai-tools-for-marketing",
          {
            A: { impressions: 10, outboundClicks: 2 },
            B: { impressions: 8, outboundClicks: 4 },
          },
        ],
      ]),
    });

    expect(rows).toHaveLength(3);
    const automation = rows.find((item) => item.pagePath === "/best-ai-automation-tools");
    const support = rows.find((item) => item.pagePath === "/best-ai-tools-for-support");
    const marketing = rows.find((item) => item.pagePath === "/best-ai-tools-for-marketing");

    expect(automation).toMatchObject({
      pagePath: "/best-ai-automation-tools",
      impressionsA: 100,
      outboundClicksA: 10,
      impressionsB: 100,
      outboundClicksB: 30,
      signal: "B_LEADING",
      isSignificant: true,
    });
    expect(automation?.ctrA).toBeCloseTo(0.1, 6);
    expect(automation?.ctrB).toBeCloseTo(0.3, 6);
    expect(automation?.liftBvsA).toBeCloseTo(2, 6);
    expect((automation?.pValue ?? 1)).toBeLessThan(0.05);

    expect(support).toMatchObject({
      pagePath: "/best-ai-tools-for-support",
      signal: "A_LEADING",
      isSignificant: true,
    });
    expect((support?.pValue ?? 1)).toBeLessThan(0.05);

    expect(marketing).toMatchObject({
      pagePath: "/best-ai-tools-for-marketing",
      signal: "NO_SIGNAL",
      isSignificant: false,
    });
    expect(marketing?.pValue).toBeNull();
  });

  it("builds hub experiment conclusions for ship, keep and run-longer decisions", () => {
    const rows = buildAffiliateHubExperimentCtrRows({
      pagePaths: [
        "/best-ai-automation-tools",
        "/best-ai-tools-for-support",
        "/best-ai-tools-for-marketing",
      ],
      labelsByPath: new Map([
        ["/best-ai-automation-tools", "Best AI Automation Tools for Ops Teams"],
        ["/best-ai-tools-for-support", "Best AI Tools for Customer Support"],
        ["/best-ai-tools-for-marketing", "Best AI Tools for Marketing Teams"],
      ]),
      variantStatsByPath: new Map([
        [
          "/best-ai-automation-tools",
          {
            A: { impressions: 100, outboundClicks: 10 },
            B: { impressions: 100, outboundClicks: 30 },
          },
        ],
        [
          "/best-ai-tools-for-support",
          {
            A: { impressions: 100, outboundClicks: 30 },
            B: { impressions: 100, outboundClicks: 10 },
          },
        ],
        [
          "/best-ai-tools-for-marketing",
          {
            A: { impressions: 10, outboundClicks: 2 },
            B: { impressions: 8, outboundClicks: 4 },
          },
        ],
      ]),
    });

    const conclusions = getHubExperimentConclusions(rows, {
      minAbsoluteLift: 0.1,
    });
    expect(conclusions).toHaveLength(3);
    expect(conclusions[0]).toMatchObject({
      pagePath: "/best-ai-automation-tools",
      decision: "SHIP_B",
    });
    expect(conclusions[1]).toMatchObject({
      pagePath: "/best-ai-tools-for-support",
      decision: "KEEP_A",
    });
    expect(conclusions[2]).toMatchObject({
      pagePath: "/best-ai-tools-for-marketing",
      decision: "RUN_LONGER",
    });
  });

  it("builds actionable recommendations for low ctr hubs", () => {
    const actions = buildLowHubCtrActionRecommendations({
      lowCtrRows: [
        {
          pagePath: "/best-ai-automation-tools",
          pageTitle: "Best AI Automation Tools for Ops Teams",
          impressions: 120,
          outboundClicks: 6,
          ctr: 0.05,
          topToolSlug: "zapier-ai",
          topToolName: "Zapier AI",
        },
      ],
      recommendedToolNamesByPath: new Map([
        [
          "/best-ai-automation-tools",
          ["Make", "n8n", "Relevance AI"],
        ],
      ]),
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]?.pagePath).toBe("/best-ai-automation-tools");
    expect(actions[0]?.priority).toBe("HIGH");
    expect(actions[0]?.expectedLiftRange).toBe("20%-40%");
    expect(actions[0]?.executionStatus).toBe("TODO");
    expect(actions[0]?.suggestedToolNames).toEqual(["Make", "n8n", "Relevance AI"]);
    expect(actions[0]?.recommendation).toMatch(/replace hero card order/i);
  });

  it("includes status-only hub rows for action recommendations", () => {
    const rows = buildHubActionRowsForRecommendations({
      lowCtrRows: [
        {
          pagePath: "/best-ai-automation-tools",
          pageTitle: "Best AI Automation Tools for Ops Teams",
          impressions: 120,
          outboundClicks: 6,
          ctr: 0.05,
          topToolSlug: "zapier-ai",
          topToolName: "Zapier AI",
        },
      ],
      labelsByPath: new Map([
        ["/best-ai-agents-for-sales", "Best AI Agents for Sales Teams"],
      ]),
      statusByPath: new Map([
        [
          "/best-ai-agents-for-sales",
          {
            status: "TESTING",
            note: "manual override",
            updatedAt: "2026-03-10T11:50:00.000Z",
          },
        ],
      ]),
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]?.pagePath).toBe("/best-ai-automation-tools");
    expect(rows[1]).toMatchObject({
      pagePath: "/best-ai-agents-for-sales",
      pageTitle: "Best AI Agents for Sales Teams",
      impressions: 0,
      outboundClicks: 0,
      ctr: 0,
      topToolSlug: null,
      topToolName: null,
    });
  });

  it("parses latest hub action status per path using log order for equal timestamps", () => {
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_hub_action",
        pagePath: "/best-ai-automation-tools",
        status: "TODO",
        note: "initial",
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "affiliate_hub_action",
        pagePath: "/best-ai-automation-tools",
        status: "VERIFIED",
        note: "rolled out",
      }),
    ];

    const statusByPath = parseAffiliateHubActionStatusByPath(lines);
    expect(statusByPath.get("/best-ai-automation-tools")).toEqual({
      status: "VERIFIED",
      note: "rolled out",
      updatedAt: "2026-03-10T11:50:00.000Z",
    });
  });

  it("filters hub action recommendations by execution status", () => {
    const items = filterAndSortHubActionRecommendations([
      {
        pagePath: "/a",
        pageTitle: "A",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "10%-25%",
        priority: "MEDIUM",
        executionStatus: "TODO",
        recommendation: "r1",
        suggestedToolNames: [],
      },
      {
        pagePath: "/b",
        pageTitle: "B",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "20%-40%",
        priority: "HIGH",
        executionStatus: "TESTING",
        recommendation: "r2",
        suggestedToolNames: [],
      },
    ], {
      status: "TESTING",
      sortBy: "UPDATED_DESC",
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.pagePath).toBe("/b");
  });

  it("sorts hub action recommendations by updated time descending", () => {
    const items = filterAndSortHubActionRecommendations([
      {
        pagePath: "/old",
        pageTitle: "Old",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "10%-25%",
        priority: "MEDIUM",
        executionStatus: "TESTING",
        executionUpdatedAt: "2026-03-10T08:00:00.000Z",
        recommendation: "r1",
        suggestedToolNames: [],
      },
      {
        pagePath: "/latest",
        pageTitle: "Latest",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "20%-40%",
        priority: "HIGH",
        executionStatus: "VERIFIED",
        executionUpdatedAt: "2026-03-10T10:00:00.000Z",
        recommendation: "r2",
        suggestedToolNames: [],
      },
      {
        pagePath: "/none",
        pageTitle: "None",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "20%-40%",
        priority: "HIGH",
        executionStatus: "TODO",
        recommendation: "r3",
        suggestedToolNames: [],
      },
    ], {
      status: "ALL",
      sortBy: "UPDATED_DESC",
    });

    expect(items.map((item) => item.pagePath)).toEqual(["/latest", "/old", "/none"]);
  });

  it("supports unverified quick filter (todo + testing)", () => {
    const items = filterAndSortHubActionRecommendations(
      [
        {
          pagePath: "/todo",
          pageTitle: "Todo",
          impressions: 10,
          outboundClicks: 1,
          ctr: 0.1,
          expectedLiftRange: "10%-25%",
          priority: "MEDIUM",
          executionStatus: "TODO",
          recommendation: "r1",
          suggestedToolNames: [],
        },
        {
          pagePath: "/testing",
          pageTitle: "Testing",
          impressions: 10,
          outboundClicks: 1,
          ctr: 0.1,
          expectedLiftRange: "10%-25%",
          priority: "MEDIUM",
          executionStatus: "TESTING",
          recommendation: "r2",
          suggestedToolNames: [],
        },
        {
          pagePath: "/verified",
          pageTitle: "Verified",
          impressions: 10,
          outboundClicks: 1,
          ctr: 0.1,
          expectedLiftRange: "10%-25%",
          priority: "MEDIUM",
          executionStatus: "VERIFIED",
          recommendation: "r3",
          suggestedToolNames: [],
        },
      ],
      {
        status: "UNVERIFIED",
        sortBy: "UPDATED_DESC",
      },
    );

    expect(items.map((item) => item.pagePath)).toEqual(["/testing", "/todo"]);
  });

  it("returns hub action status counts for quick filters", () => {
    const counts = getHubActionStatusCounts([
      {
        pagePath: "/todo",
        pageTitle: "Todo",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "10%-25%",
        priority: "MEDIUM",
        executionStatus: "TODO",
        recommendation: "r1",
        suggestedToolNames: [],
      },
      {
        pagePath: "/testing",
        pageTitle: "Testing",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "10%-25%",
        priority: "MEDIUM",
        executionStatus: "TESTING",
        recommendation: "r2",
        suggestedToolNames: [],
      },
      {
        pagePath: "/verified",
        pageTitle: "Verified",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "10%-25%",
        priority: "MEDIUM",
        executionStatus: "VERIFIED",
        recommendation: "r3",
        suggestedToolNames: [],
      },
      {
        pagePath: "/dismissed",
        pageTitle: "Dismissed",
        impressions: 10,
        outboundClicks: 1,
        ctr: 0.1,
        expectedLiftRange: "10%-25%",
        priority: "MEDIUM",
        executionStatus: "DISMISSED",
        recommendation: "r4",
        suggestedToolNames: [],
      },
    ]);

    expect(counts).toEqual({
      ALL: 4,
      TODO: 1,
      TESTING: 1,
      VERIFIED: 1,
      DISMISSED: 1,
      UNVERIFIED: 2,
    });
  });
});
