import { describe, expect, it } from "vitest";
import {
  isAdsPathAllowed,
  isToolDetailAdsEligible,
  isUseCaseDetailAdsEligible,
} from "../../lib/adsense-policy";

describe("adsense policy", () => {
  it("blocks ad rendering on sensitive paths", () => {
    expect(isAdsPathAllowed("/tools/zapier-ai")).toBe(true);
    expect(isAdsPathAllowed("/use-cases/support-automation")).toBe(true);
    expect(isAdsPathAllowed("/admin/login")).toBe(false);
    expect(isAdsPathAllowed("/admin/affiliate")).toBe(false);
    expect(isAdsPathAllowed("/api/outbound")).toBe(false);
  });

  it("allows ads for rich tool detail content and blocks thin placeholders", () => {
    expect(
      isToolDetailAdsEligible({
        description:
          "Best for multi-app automations with low setup friction and dependable operational handoffs for operations teams.",
        highlights: ["a", "b", "c"],
        comparisonNotes: ["1", "2", "3"],
        faqCount: 4,
      }),
    ).toBe(true);

    expect(
      isToolDetailAdsEligible({
        description:
          "This profile is being expanded with deeper benchmarks and setup guidance.",
        highlights: ["a"],
        comparisonNotes: ["1"],
        faqCount: 1,
      }),
    ).toBe(false);
  });

  it("allows ads for rich use-case content and blocks short placeholders", () => {
    expect(
      isUseCaseDetailAdsEligible({
        description:
          "Explore tools that reduce response time, triage tickets, and automate repetitive support workflows.",
        summary:
          "Useful for teams aiming to improve SLA performance while keeping support quality consistent across human and automation handoffs.",
        checklist: ["a", "b", "c"],
        toolsCount: 3,
      }),
    ).toBe(true);

    expect(
      isUseCaseDetailAdsEligible({
        description: "Curated tools and benchmarks.",
        summary: "Profile details are being expanded with richer benchmark data.",
        checklist: ["a"],
        toolsCount: 1,
      }),
    ).toBe(false);
  });
});
