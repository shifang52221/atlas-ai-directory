import { describe, expect, it } from "vitest";
import {
  getCanonicalToolVsHref,
  getToolVsPageByPairSlugs,
  getToolVsPageBySlug,
  getToolVsPageSlugs,
} from "../../lib/tool-vs-pages";

const placeholderPhrases = [
  "todo",
  "tbd",
  "coming soon",
  "available shortly",
  "placeholder",
];

describe("tool-vs page registry", () => {
  it("returns the approved canonical compare page slugs", () => {
    expect(getToolVsPageSlugs()).toEqual([
      "zapier-ai-vs-make",
      "zapier-ai-vs-n8n",
      "make-vs-n8n",
      "make-vs-clay",
      "relevance-ai-vs-lindy",
      "relevance-ai-vs-clay",
    ]);
  });

  it("resolves mirrored tool inputs to the same canonical pair", () => {
    const canonicalPair = getToolVsPageByPairSlugs("zapier-ai", "make");
    const mirroredPair = getToolVsPageByPairSlugs("make", "zapier-ai");

    expect(canonicalPair).not.toBeNull();
    expect(mirroredPair).not.toBeNull();
    expect(canonicalPair?.pairSlug).toBe("zapier-ai-vs-make");
    expect(mirroredPair?.pairSlug).toBe("zapier-ai-vs-make");
    expect(getCanonicalToolVsHref("make", "zapier-ai")).toBe(
      "/compare/zapier-ai-vs-make",
    );
  });

  it("returns null for unsupported compare pairs", () => {
    expect(getToolVsPageByPairSlugs("clay", "lindy")).toBeNull();
    expect(getCanonicalToolVsHref("clay", "lindy")).toBeNull();
    expect(getToolVsPageBySlug("clay-vs-lindy")).toBeNull();
  });

  it("exposes complete editorial content for a curated compare page", () => {
    const page = getToolVsPageBySlug("zapier-ai-vs-make");

    expect(page).not.toBeNull();
    expect(page?.title).toBe("Zapier AI vs Make");
    expect(page?.heroVerdict.length).toBeGreaterThan(80);
    expect(page?.quickVerdicts.length).toBeGreaterThanOrEqual(4);
    expect(page?.comparisonRows.length).toBeGreaterThanOrEqual(5);
    expect(page?.chooseToolA.length).toBeGreaterThanOrEqual(3);
    expect(page?.chooseToolB.length).toBeGreaterThanOrEqual(3);
    expect(page?.sections.length).toBeGreaterThanOrEqual(4);
    expect(page?.faqItems.length).toBeGreaterThanOrEqual(4);
    expect(page?.comparisonRows[0]).toMatchObject({
      label: "Best for",
      toolASummary: expect.any(String),
      toolBSummary: expect.any(String),
    });
    expect(page?.relatedLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: "/tools/zapier-ai" }),
        expect.objectContaining({ href: "/tools/make" }),
        expect.objectContaining({ href: "/use-cases/internal-ops" }),
      ]),
    );
    expect(
      page?.sections.every(
        (section) =>
          section.body.length > 60 &&
          !section.body.toLowerCase().includes("available shortly"),
      ),
    ).toBe(true);
  });

  it("keeps every curated compare page above thin-content quality bars", () => {
    for (const pairSlug of getToolVsPageSlugs()) {
      const page = getToolVsPageBySlug(pairSlug);

      expect(page, `${pairSlug} should resolve`).not.toBeNull();
      expect(page?.faqItems.length, `${pairSlug} faq count`).toBeGreaterThanOrEqual(4);
      expect(page?.sections.length, `${pairSlug} section count`).toBeGreaterThanOrEqual(4);
      expect(page?.chooseToolA.length, `${pairSlug} choose tool A block`).toBeGreaterThanOrEqual(3);
      expect(page?.chooseToolB.length, `${pairSlug} choose tool B block`).toBeGreaterThanOrEqual(3);
      expect(page?.metaDescription.length, `${pairSlug} meta description length`).toBeGreaterThan(110);
      expect(page?.finalRecommendation.length, `${pairSlug} final recommendation length`).toBeGreaterThan(80);

      const editorialText = [
        page?.title ?? "",
        page?.heroVerdict ?? "",
        page?.finalRecommendation ?? "",
        ...(page?.quickVerdicts ?? []),
        ...(page?.chooseToolA ?? []),
        ...(page?.chooseToolB ?? []),
        ...(page?.sections.map((section) => section.body) ?? []),
        ...(page?.faqItems.flatMap((item) => [item.question, item.answer]) ?? []),
      ].join(" ").toLowerCase();

      for (const phrase of placeholderPhrases) {
        expect(editorialText, `${pairSlug} should not contain "${phrase}"`).not.toContain(
          phrase,
        );
      }
    }
  });
});
