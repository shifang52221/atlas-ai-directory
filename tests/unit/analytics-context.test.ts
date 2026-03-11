import { describe, expect, it } from "vitest";
import {
  buildPrivacySafeAnalyticsContext,
  extractCountryCodeFromHeaders,
  sanitizePlacementId,
} from "../../lib/analytics-context";

describe("analytics context", () => {
  it("extracts safe country code from headers", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "us",
    });
    expect(extractCountryCodeFromHeaders(headers)).toBe("US");

    const fallbackHeaders = new Headers({
      "cf-ipcountry": "de",
    });
    expect(extractCountryCodeFromHeaders(fallbackHeaders)).toBe("DE");

    const invalidHeaders = new Headers({
      "x-vercel-ip-country": "xx",
    });
    expect(extractCountryCodeFromHeaders(invalidHeaders)).toBeUndefined();
  });

  it("builds stable privacy-safe session identifiers", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.2",
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
    });

    const first = buildPrivacySafeAnalyticsContext({
      headers,
      now: new Date("2026-03-11T03:00:00.000Z"),
      sessionSalt: "fixed-salt",
    });
    const second = buildPrivacySafeAnalyticsContext({
      headers,
      now: new Date("2026-03-11T18:00:00.000Z"),
      sessionSalt: "fixed-salt",
    });

    expect(first.visitorHash).toBeTruthy();
    expect(first.sessionId).toBeTruthy();
    expect(first.visitorHash).toBe(second.visitorHash);
    expect(first.sessionId).toBe(second.sessionId);
  });

  it("sanitizes placement ids", () => {
    expect(sanitizePlacementId("tool_profile_primary")).toBe("tool_profile_primary");
    expect(sanitizePlacementId("Upper-Case+Bad")).toBeUndefined();
    expect(sanitizePlacementId("")).toBeUndefined();
  });
});
