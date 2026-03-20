import { describe, expect, it } from "vitest";
import { getHomepageData } from "../../lib/homepage-data";

describe("homepage data", () => {
  it("keeps fallback featured tool blurbs launch-ready", async () => {
    const data = await getHomepageData();

    expect(data.featuredTools.length).toBeGreaterThan(0);

    for (const tool of data.featuredTools) {
      expect(tool.blurb.toLowerCase()).not.toContain("available shortly");
      expect(tool.blurb.toLowerCase()).not.toContain("being expanded");
      expect(tool.blurb.trim().length).toBeGreaterThan(20);
    }
  });
});
