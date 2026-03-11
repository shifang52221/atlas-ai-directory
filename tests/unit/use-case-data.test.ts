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
    expect(profile?.fitSignals.length).toBeGreaterThanOrEqual(3);
    expect(profile?.avoidSignals.length).toBeGreaterThanOrEqual(2);
    expect(profile?.kpis.length).toBeGreaterThanOrEqual(3);
    expect(profile?.rolloutPlan.length).toBeGreaterThanOrEqual(4);
    expect(profile?.faqItems.length).toBeGreaterThanOrEqual(4);
    expect(profile?.tools[0]?.outboundHref).toContain("/api/outbound?");
  });
});
