import { describe, expect, it } from "vitest";
import {
  buildEditorialHubMetadata,
  buildEditorialHubExperimentView,
  getRelatedEditorialHubLinksForTool,
  getEditorialHubPaths,
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "../../lib/editorial-hubs";

const commercialSprintPaths = [
  "/best-ai-automation-tools-for-small-business",
  "/best-ai-sales-agents-for-smb",
  "/best-ai-tools-for-marketing-under-100",
  "/best-ai-tools-for-support-ticket-triage",
  "/make-alternatives",
  "/semrush-alternatives",
  "/hubspot-alternatives-for-startups",
  "/monday-vs-clickup-for-ops",
  "/synthesia-alternatives",
  "/descript-alternatives",
  "/ai-sales-automation-tools-for-lead-enrichment",
  "/ai-workflow-tools-for-internal-operations",
] as const;

describe("editorial hub experiments", () => {
  it("parses variant input and defaults to A", () => {
    expect(parseEditorialHubVariant("a")).toBe("A");
    expect(parseEditorialHubVariant("B")).toBe("B");
    expect(parseEditorialHubVariant("unknown")).toBe("A");
    expect(parseEditorialHubVariant(undefined)).toBe("A");
  });

  it("builds variant B with adjusted hero and reordered top picks", () => {
    const config = getEditorialHubConfigOrThrow("/best-ai-automation-tools");
    const view = buildEditorialHubExperimentView({
      config,
      variant: "B",
    });

    expect(view.variant).toBe("B");
    expect(view.heroSubtitle).not.toBe(config.heroSubtitle);
    expect(view.ctaPrimaryLabel).not.toBe("Visit");
    expect(view.rankedTools.slice(0, 3).map((item) => item.slug)).toEqual([
      "make",
      "zapier-ai",
      "n8n",
    ]);
  });

  it("keeps concrete evidence and cross-hub links on every launch hub", () => {
    const paths = getEditorialHubPaths();

    for (const path of paths) {
      const config = getEditorialHubConfigOrThrow(path);
      const otherHubPaths = paths.filter((item) => item !== path);
      const isCommercialSprintPath = commercialSprintPaths.includes(
        path as (typeof commercialSprintPaths)[number],
      );

      expect(config.recommendations.length).toBeGreaterThanOrEqual(
        isCommercialSprintPath ? 3 : 5,
      );
      for (const recommendation of config.recommendations) {
        expect(recommendation.evidence).toBeTruthy();
        expect(recommendation.evidence.length).toBeGreaterThan(24);
      }

      expect(
        config.continueLinks.some((link) => otherHubPaths.includes(link.href)),
      ).toBe(true);
      expect(
        config.continueLinks.some((link) => link.href === "/affiliate-disclosure"),
      ).toBe(true);

      expect(config.whoFits.length).toBeGreaterThanOrEqual(3);
      expect(config.avoidIf.length).toBeGreaterThanOrEqual(2);
      expect(config.implementationPlan.length).toBeGreaterThanOrEqual(4);
      expect(config.kpiScorecard.length).toBeGreaterThanOrEqual(3);
      expect(config.buyingMistakes.length).toBeGreaterThanOrEqual(3);
      expect(config.rolloutChecklist.length).toBeGreaterThanOrEqual(6);
      expect(config.comparisonQuestions.length).toBeGreaterThanOrEqual(3);
      for (const item of config.buyingMistakes) {
        expect(item.length).toBeGreaterThan(24);
      }
      for (const item of config.rolloutChecklist) {
        expect(item.length).toBeGreaterThan(20);
      }
      for (const item of config.comparisonQuestions) {
        expect(item.question).toMatch(/\bvs\b/i);
        expect(item.answer.length).toBeGreaterThan(30);
      }
    }
  });

  it("includes commercial sprint pages with minimum content quality", () => {
    const paths = getEditorialHubPaths();

    for (const path of commercialSprintPaths) {
      expect(paths).toContain(path);
      const config = getEditorialHubConfigOrThrow(path);

      expect(config.title).toBeTruthy();
      expect(config.metadataDescription.length).toBeGreaterThan(30);
      expect(config.recommendations.length).toBeGreaterThanOrEqual(3);
      expect(config.faqItems.length).toBeGreaterThanOrEqual(3);
      expect(
        config.faqItems.some((item) =>
          item.question.toLowerCase().includes(config.title.split(" ")[0]?.toLowerCase() || ""),
        ),
      ).toBe(true);
      for (const faq of config.faqItems) {
        expect(faq.question.endsWith("?")).toBe(true);
      }

      const compareLink = config.continueLinks.find((item) => item.href === "/compare");
      const toolsLink = config.continueLinks.find((item) => item.href === "/tools");
      expect(compareLink?.label).toBe("Compare AI tools side by side");
      expect(toolsLink?.label).toBe("Browse all AI tools");
    }
  });

  it("builds social metadata for hub pages", () => {
    const config = getEditorialHubConfigOrThrow("/make-alternatives");
    const metadata = buildEditorialHubMetadata(config, {
      baseUrl: "https://atlas-ai.example",
    });

    expect(metadata.title).toMatch(/Make Alternatives \(2026\)/);
    expect(metadata.title).toMatch(/Better Options/);
    expect(String(metadata.description).length).toBeLessThanOrEqual(160);
    expect(metadata.description).toMatch(/alternatives/i);
    expect(metadata.alternates?.canonical).toBe(
      "https://atlas-ai.example/make-alternatives",
    );
    expect(metadata.openGraph?.url).toBe(
      "https://atlas-ai.example/make-alternatives",
    );
    expect(metadata.openGraph?.type).toBe("article");
    expect(metadata.twitter?.card).toBe("summary");
  });

  it("uses intent-aware seo title hints across best and vs pages", () => {
    const bestConfig = getEditorialHubConfigOrThrow(
      "/best-ai-automation-tools-for-small-business",
    );
    const vsConfig = getEditorialHubConfigOrThrow("/monday-vs-clickup-for-ops");

    const bestMetadata = buildEditorialHubMetadata(bestConfig, {
      baseUrl: "https://atlas-ai.example",
    });
    const vsMetadata = buildEditorialHubMetadata(vsConfig, {
      baseUrl: "https://atlas-ai.example",
    });

    expect(String(bestMetadata.title)).toContain("(2026)");
    expect(String(vsMetadata.title)).toContain("Which Tool Wins?");
    expect(String(vsMetadata.description)).toMatch(/side by side/i);
  });

  it("applies commercial variant B copy and reordered top picks", () => {
    const config = getEditorialHubConfigOrThrow("/make-alternatives");
    const view = buildEditorialHubExperimentView({
      config,
      variant: "B",
    });

    expect(view.heroSubtitle).toContain("Buyer-first shortlist");
    expect(view.ctaPrimaryLabel).toBe("Start trial");
    expect(view.ctaSecondaryLabel).toBe("View profile");
    expect(view.tableCtaLabel).toBe("Open pricing");
    expect(view.rankedTools.slice(0, 3).map((item) => item.slug)).toEqual([
      "n8n",
      "zapier-ai",
      "relevance-ai",
    ]);
  });

  it("derives related editorial hub links for tool detail pages", () => {
    const links = getRelatedEditorialHubLinksForTool({
      toolSlug: "zapier-ai",
      toolName: "Zapier AI",
    });

    expect(links).toHaveLength(3);
    expect(links.map((item) => item.href)).toEqual([
      "/best-ai-automation-tools",
      "/best-ai-agents-for-sales",
      "/best-ai-tools-for-support",
    ]);
    expect(links[0]).toMatchObject({
      title: "Best AI Automation Tools for Ops Teams",
      matchType: "recommendation",
      reason: "Fast cross-app launch with low ops overhead",
    });
    expect(links[0]?.supportingQuestion).toContain("Zapier AI vs Make");
  });

  it("keeps related tool hub links deduplicated and ranks title-targeted guides first", () => {
    const links = getRelatedEditorialHubLinksForTool({
      toolSlug: "make",
      toolName: "Make",
      limit: 5,
    });

    expect(new Set(links.map((item) => item.href)).size).toBe(links.length);
    expect(links[0]).toMatchObject({
      href: "/make-alternatives",
      matchType: "title",
    });
    expect(
      links.some(
        (item) =>
          item.href === "/best-ai-automation-tools" &&
          item.matchType === "recommendation",
      ),
    ).toBe(true);
  });
});

