import { describe, expect, it } from "vitest";
import {
  buildEditorialHubExperimentView,
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
});

