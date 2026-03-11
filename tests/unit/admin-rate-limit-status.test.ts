import { describe, expect, it } from "vitest";
import {
  getRateLimitExportStatusOptions,
  isDefaultRateLimitExportStatus,
  parseRateLimitExportStatus,
} from "../../lib/admin-rate-limit-status";

describe("admin rate-limit export status", () => {
  it("parses status and defaults to all", () => {
    expect(parseRateLimitExportStatus("all")).toBe("all");
    expect(parseRateLimitExportStatus("blocked")).toBe("blocked");
    expect(parseRateLimitExportStatus("invalid")).toBe("all");
    expect(parseRateLimitExportStatus(undefined)).toBe("all");
  });

  it("exposes status options", () => {
    expect(getRateLimitExportStatusOptions().map((item) => item.key)).toEqual([
      "all",
      "blocked",
    ]);
  });

  it("identifies default status", () => {
    expect(isDefaultRateLimitExportStatus("all")).toBe(true);
    expect(isDefaultRateLimitExportStatus("blocked")).toBe(false);
  });
});
