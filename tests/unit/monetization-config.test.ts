import { describe, expect, it } from "vitest";
import { applyAffiliateTemplate } from "../../lib/monetization-config";

describe("monetization config", () => {
  it("applies affiliate and utm params to outbound URL", () => {
    const mapped = applyAffiliateTemplate("https://example.com/pricing", {
      refParam: "ref",
      refValue: "atlas",
      utmSource: "atlas_directory",
      utmMedium: "affiliate",
      utmCampaign: "tool_profile",
    });

    expect(mapped).toContain("ref=atlas");
    expect(mapped).toContain("utm_source=atlas_directory");
    expect(mapped).toContain("utm_medium=affiliate");
    expect(mapped).toContain("utm_campaign=tool_profile");
  });

  it("returns original value on invalid URL", () => {
    const mapped = applyAffiliateTemplate("not-a-url", {
      refParam: "ref",
      refValue: "atlas",
      utmSource: "atlas_directory",
      utmMedium: "affiliate",
      utmCampaign: "tool_profile",
    });

    expect(mapped).toBe("not-a-url");
  });
});
