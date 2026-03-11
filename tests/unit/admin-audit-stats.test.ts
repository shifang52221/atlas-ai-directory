import { describe, expect, it } from "vitest";
import { parseRateLimitAuditEntries } from "../../lib/admin-audit-stats";

describe("admin audit stats", () => {
  it("aggregates rate limit events by bucket within window", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "rate_limit",
        bucket: "submit_form",
        allowed: false,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:51:00.000Z",
        scope: "rate_limit",
        bucket: "submit_form",
        allowed: true,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:52:00.000Z",
        scope: "rate_limit",
        bucket: "admin_login",
        allowed: false,
      }),
      JSON.stringify({
        timestamp: "2026-03-09T10:00:00.000Z",
        scope: "rate_limit",
        bucket: "submit_form",
        allowed: false,
      }),
    ];

    const stats = parseRateLimitAuditEntries(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
    });

    expect(stats.totalEvents).toBe(3);
    expect(stats.blockedEvents).toBe(2);
    expect(stats.byBucket).toEqual([
      { label: "submit_form", count: 1 },
      { label: "admin_login", count: 1 },
    ]);
    expect(stats.blockedTrend7d).toHaveLength(7);
    expect(stats.blockedTrend7d.at(-1)).toEqual({
      dayKey: "2026-03-10",
      count: 2,
    });
  });

  it("supports bucket filter and keeps trend in window", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "rate_limit",
        bucket: "submit_form",
        allowed: false,
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:52:00.000Z",
        scope: "rate_limit",
        bucket: "admin_login",
        allowed: false,
      }),
      JSON.stringify({
        timestamp: "2026-03-09T11:52:00.000Z",
        scope: "rate_limit",
        bucket: "submit_form",
        allowed: false,
      }),
    ];

    const stats = parseRateLimitAuditEntries(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
      bucket: "submit_form",
    });

    expect(stats.blockedEvents).toBe(1);
    expect(stats.byBucket).toEqual([{ label: "submit_form", count: 1 }]);
    expect(stats.blockedTrend7d.at(-1)).toEqual({
      dayKey: "2026-03-10",
      count: 1,
    });
  });

  it("ignores malformed lines and unrelated scopes", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const lines = [
      "not json",
      JSON.stringify({
        timestamp: "2026-03-10T11:50:00.000Z",
        scope: "admin_auth",
        event: "login",
      }),
      JSON.stringify({
        timestamp: "2026-03-10T11:51:00.000Z",
        scope: "rate_limit",
        bucket: "",
        allowed: false,
      }),
    ];

    const stats = parseRateLimitAuditEntries(lines, {
      nowMs: now,
      windowMs: 24 * 60 * 60 * 1000,
    });

    expect(stats.totalEvents).toBe(0);
    expect(stats.blockedEvents).toBe(0);
    expect(stats.byBucket).toEqual([]);
    expect(stats.blockedTrend7d).toHaveLength(7);
  });
});
