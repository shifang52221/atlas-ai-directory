import { describe, expect, it } from "vitest";
import {
  getRateLimitIpMatchModeOptions,
  isDefaultRateLimitIpMatchMode,
  parseRateLimitIpMatchMode,
} from "../../lib/admin-rate-limit-ip-mode";

describe("admin rate-limit ip mode", () => {
  it("parses match mode and defaults to contains", () => {
    expect(parseRateLimitIpMatchMode("contains")).toBe("contains");
    expect(parseRateLimitIpMatchMode("exact")).toBe("exact");
    expect(parseRateLimitIpMatchMode("other")).toBe("contains");
    expect(parseRateLimitIpMatchMode(undefined)).toBe("contains");
  });

  it("returns mode options", () => {
    expect(getRateLimitIpMatchModeOptions().map((item) => item.key)).toEqual([
      "contains",
      "exact",
    ]);
  });

  it("knows default mode", () => {
    expect(isDefaultRateLimitIpMatchMode("contains")).toBe(true);
    expect(isDefaultRateLimitIpMatchMode("exact")).toBe(false);
  });
});
