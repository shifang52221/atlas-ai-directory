import { describe, expect, it } from "vitest";
import { getToolDetailSeoContent } from "../../lib/tool-detail-seo-content";

describe("tool detail seo content", () => {
  it("uses curated override for zapier-ai", () => {
    const content = getToolDetailSeoContent({
      slug: "zapier-ai",
      name: "Zapier AI",
      categories: ["Automation", "Sales Ops"],
      highlights: ["Fast setup"],
      comparisonNotes: ["Compare reliability"],
      setupLabel: "~45 min to first workflow",
      pricingLabel: "Starter plans from ~$20/mo",
    });

    expect(content.reviewScore).toBe(4.7);
    expect(content.faqItems[0]?.question).toBe(
      "Is Zapier AI worth it for RevOps and SMB operations teams?",
    );
    expect(
      content.faqItems.some((item) =>
        item.question.includes("Zapier AI vs Make"),
      ),
    ).toBe(true);
    expect(content.faqItems.length).toBeGreaterThanOrEqual(6);
    expect(content.alternativeSlugs).toEqual(["make", "n8n", "relevance-ai"]);
    expect(content.useCaseLinks[0]?.href).toBe("/use-cases/ai-sales");
  });

  it("uses curated overrides for clay, relevance-ai, and lindy", () => {
    const clay = getToolDetailSeoContent({
      slug: "clay",
      name: "Clay",
      categories: ["Sales Ops", "Marketing"],
      highlights: ["Strong enrichment"],
      comparisonNotes: ["Validate enrichment quality"],
      setupLabel: "~50 min to first outbound flow",
      pricingLabel: "Starter plans vary by credits",
    });
    expect(clay.reviewScore).toBe(4.6);
    expect(clay.faqItems[0]?.question).toContain("Clay");
    expect(clay.alternativeSlugs).toEqual(["zapier-ai", "make", "relevance-ai"]);
    expect(clay.useCaseLinks[0]?.href).toBe("/use-cases/lead-enrichment");

    const relevance = getToolDetailSeoContent({
      slug: "relevance-ai",
      name: "Relevance AI",
      categories: ["AI Agents", "Sales Ops"],
      highlights: ["Role-based AI workforce"],
      comparisonNotes: ["Assess multi-agent reliability"],
      setupLabel: "~70 min to first team-ready workflow",
      pricingLabel: "Plans vary by seats and usage",
    });
    expect(relevance.reviewScore).toBe(4.6);
    expect(relevance.faqItems[0]?.question).toContain("Relevance AI");
    expect(relevance.faqItems.length).toBeGreaterThanOrEqual(6);
    expect(
      relevance.faqItems.some((item) =>
        item.question.includes("Relevance AI vs Lindy"),
      ),
    ).toBe(true);
    expect(
      relevance.faqItems.some((item) =>
        item.question.includes("best Relevance AI alternatives"),
      ),
    ).toBe(true);
    expect(relevance.alternativeSlugs).toEqual(["lindy", "zapier-ai", "n8n"]);
    expect(relevance.useCaseLinks[0]?.href).toBe("/use-cases/research-agents");

    const lindy = getToolDetailSeoContent({
      slug: "lindy",
      name: "Lindy",
      categories: ["AI Agents", "Customer Support"],
      highlights: ["Operator-style AI agents"],
      comparisonNotes: ["Evaluate support handoff quality"],
      setupLabel: "~40 min to first usable agent",
      pricingLabel: "Public pricing varies by usage",
    });
    expect(lindy.reviewScore).toBe(4.5);
    expect(lindy.faqItems[0]?.question).toContain("Lindy");
    expect(lindy.faqItems.length).toBeGreaterThanOrEqual(6);
    expect(
      lindy.faqItems.some((item) =>
        item.question.includes("Lindy vs Relevance AI"),
      ),
    ).toBe(true);
    expect(
      lindy.faqItems.some((item) =>
        item.question.includes("best Lindy alternatives"),
      ),
    ).toBe(true);
    expect(lindy.alternativeSlugs).toEqual(["relevance-ai", "zapier-ai", "make"]);
    expect(lindy.useCaseLinks[0]?.href).toBe("/use-cases/support-automation");
  });

  it("uses keyword-cluster faq coverage for make", () => {
    const make = getToolDetailSeoContent({
      slug: "make",
      name: "Make",
      categories: ["Automation", "Marketing"],
      highlights: ["Visual logic"],
      comparisonNotes: ["Evaluate routing complexity"],
      setupLabel: "~60 min to first production scenario",
      pricingLabel: "Entry plans from ~$9/mo",
    });

    expect(make.faqItems.length).toBeGreaterThanOrEqual(6);
    expect(
      make.faqItems.some((item) =>
        item.question.includes("Make vs Zapier AI"),
      ),
    ).toBe(true);
    expect(
      make.faqItems.some((item) => item.question.includes("best Make alternatives")),
    ).toBe(true);
  });

  it("falls back to generated content for non-curated tools", () => {
    const content = getToolDetailSeoContent({
      slug: "custom-tool",
      name: "Custom Tool",
      categories: ["Automation"],
      highlights: ["Flexible"],
      comparisonNotes: ["Check total cost"],
      setupLabel: "~30 min",
      pricingLabel: "From USD 19",
    });

    expect(content.faqItems).toHaveLength(4);
    expect(content.faqItems[0]?.question).toContain("Who should use Custom Tool");
    expect(content.alternativeSlugs).toHaveLength(3);
    expect(content.useCaseLinks.length).toBeGreaterThan(0);
  });
});
