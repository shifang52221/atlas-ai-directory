import { describe, expect, it } from "vitest";
import {
  buildEditorialHubExperimentView,
  getEditorialHubPaths,
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "../../lib/editorial-hubs";

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

      expect(config.recommendations.length).toBeGreaterThanOrEqual(5);
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
    }
  });
});
