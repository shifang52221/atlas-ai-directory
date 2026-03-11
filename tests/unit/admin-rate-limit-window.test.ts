import { describe, expect, it } from "vitest";
import {
  getRateLimitWindowDays,
  getRateLimitWindowOptions,
  isDefaultRateLimitWindow,
  parseRateLimitWindow,
} from "../../lib/admin-rate-limit-window";

describe("admin rate-limit window", () => {
  it("parses known window keys and defaults to 7d", () => {
    expect(parseRateLimitWindow("24h")).toBe("24h");
    expect(parseRateLimitWindow("7d")).toBe("7d");
    expect(parseRateLimitWindow("30d")).toBe("30d");
    expect(parseRateLimitWindow("invalid")).toBe("7d");
    expect(parseRateLimitWindow(undefined)).toBe("7d");
  });

  it("returns window day values", () => {
    expect(getRateLimitWindowDays("24h")).toBe(1);
    expect(getRateLimitWindowDays("7d")).toBe(7);
    expect(getRateLimitWindowDays("30d")).toBe(30);
  });

  it("exposes options and default indicator", () => {
    const keys = getRateLimitWindowOptions().map((item) => item.key);
    expect(keys).toEqual(["24h", "7d", "30d"]);
    expect(isDefaultRateLimitWindow("7d")).toBe(true);
    expect(isDefaultRateLimitWindow("30d")).toBe(false);
  });
});
