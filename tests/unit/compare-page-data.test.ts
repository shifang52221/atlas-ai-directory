import { describe, expect, it } from "vitest";
import { getComparePageData } from "../../lib/compare-page-data";

describe("compare page data", () => {
  it("builds ranked, deduplicated head-to-head comparisons from existing relationships", () => {
    const data = getComparePageData();
    const titles = data.headToHeadComparisons.map((item) => item.title);

    expect(data.headToHeadComparisons).toHaveLength(6);
    expect(titles[0]).toBe("Zapier AI vs Make");
    expect(titles).toContain("Make vs n8n");
    expect(titles).toContain("Relevance AI vs Lindy");
    expect(titles).not.toContain("Make vs Zapier AI");
    expect(new Set(titles).size).toBe(titles.length);
    expect(data.headToHeadComparisons[0]).toMatchObject({
      title: "Zapier AI vs Make",
      href: "/tools/zapier-ai#compare-alternatives",
    });
  });

  it("assembles comparison clusters from existing use-case tool sets", () => {
    const data = getComparePageData();

    expect(data.useCaseComparisons.slice(0, 3).map((item) => item.href)).toEqual([
      "/use-cases/ai-sales",
      "/use-cases/support-automation",
      "/use-cases/internal-ops",
    ]);
    expect(data.useCaseComparisons[0]).toMatchObject({
      title: "Compare tools for AI Sales",
    });
    expect(data.useCaseComparisons[0]?.toolNames).toEqual([
      "Clay",
      "Zapier AI",
      "Relevance AI",
    ]);
    expect(
      data.useCaseComparisons.every((item) => item.description.length > 40),
    ).toBe(true);
  });

  it("returns balanced buying-guide shortcuts across best-of, alternatives, and vs pages", () => {
    const data = getComparePageData();

    expect(data.buyingGuideShortcuts).toHaveLength(6);
    expect(data.buyingGuideShortcuts[0]).toMatchObject({
      href: "/best-ai-automation-tools",
      guideType: "best_of",
    });
    expect(
      data.buyingGuideShortcuts.map((item) => item.href),
    ).toEqual(
      expect.arrayContaining([
        "/best-ai-agents-for-sales",
        "/best-ai-tools-for-support",
        "/best-ai-tools-for-marketing-under-100",
        "/make-alternatives",
        "/monday-vs-clickup-for-ops",
      ]),
    );
    expect(
      new Set(data.buyingGuideShortcuts.map((item) => item.guideType)),
    ).toEqual(new Set(["best_of", "alternatives", "vs"]));
  });
});
