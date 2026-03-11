import { describe, expect, it } from "vitest";
import {
  getFallbackUseCaseSlugs,
  getUseCaseProfileBySlug,
} from "../../lib/use-case-data";

describe("use-case data", () => {
  it("returns fallback use-case slugs for static generation", () => {
    const slugs = getFallbackUseCaseSlugs();
    expect(slugs).toContain("support-automation");
    expect(slugs).toContain("lead-enrichment");
  });

  it("provides fallback profile content by slug", async () => {
    const profile = await getUseCaseProfileBySlug("support-automation");
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe("Support Automation");
    expect(profile?.tools.length).toBeGreaterThan(0);
    expect(profile?.tools[0]?.outboundHref).toContain("/api/outbound?");
  });
});
