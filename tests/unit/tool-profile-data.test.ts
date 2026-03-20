import { describe, expect, it } from "vitest";
import { LinkKind } from "@prisma/client";
import { isValidOutboundSignature } from "../../lib/outbound-signature";
import {
  buildOutboundHref,
  getFallbackToolProfiles,
} from "../../lib/tool-profile-data";

describe("tool profile data", () => {
  it("builds outbound href with required params", () => {
    const href = buildOutboundHref({
      toolSlug: "zapier-ai",
      targetUrl: "https://zapier.com",
      linkKind: LinkKind.AFFILIATE,
      sourcePath: "/tools/zapier-ai",
      affiliateLinkId: "link_1",
      placementId: "tool_profile_primary",
    });

    expect(href).toContain("/api/outbound?");
    expect(href).toContain("toolSlug=zapier-ai");
    expect(href).toContain("linkKind=AFFILIATE");
    expect(href).toContain("affiliateLinkId=link_1");
    expect(href).toContain("placementId=tool_profile_primary");
  });

  it("includes fallback profiles with generated outbound links", () => {
    const profiles = getFallbackToolProfiles();
    const zapier = profiles.find((item) => item.slug === "zapier-ai");

    expect(zapier).toBeDefined();
    expect(zapier?.outboundHref).toContain("/api/outbound?");
    expect(zapier?.outboundHref).toContain("toolSlug=zapier-ai");
  });

  it("keeps signed outbound params consistent for all fallback profiles", () => {
    const profiles = getFallbackToolProfiles();
    expect(profiles.length).toBeGreaterThan(0);

    for (const profile of profiles) {
      const outbound = new URL(profile.outboundHref, "http://localhost:3000");
      expect(outbound.pathname).toBe("/api/outbound");

      const toolSlug = outbound.searchParams.get("toolSlug");
      const target = outbound.searchParams.get("target");
      const sourcePath = outbound.searchParams.get("sourcePath");
      const linkKind = outbound.searchParams.get("linkKind");
      const placementId = outbound.searchParams.get("placementId");
      const signature = outbound.searchParams.get("sig");

      expect(toolSlug).toBe(profile.slug);
      expect(sourcePath).toBe(`/tools/${profile.slug}`);
      expect(target).toContain("utm_source=");
      expect(linkKind).toBe("DIRECT");
      expect(signature).toBeTruthy();

      const isValid = isValidOutboundSignature(
        {
          toolSlug: toolSlug || "",
          target: target || "",
          linkKind: LinkKind.DIRECT,
          sourcePath: sourcePath || "",
          placementId: placementId || undefined,
        },
        signature,
      );
      expect(isValid).toBe(true);
    }
  });

  it("keeps fallback profile copy free of placeholder phrasing", () => {
    const profiles = getFallbackToolProfiles();
    expect(profiles.length).toBeGreaterThan(0);

    for (const profile of profiles) {
      const combinedCopy = [
        profile.description,
        profile.setupLabel,
        profile.pricingLabel,
      ]
        .join(" ")
        .toLowerCase();

      expect(combinedCopy).not.toContain("available shortly");
      expect(combinedCopy).not.toContain("being expanded");
      expect(combinedCopy).not.toContain("setup varies by team workflow");
      expect(combinedCopy).not.toContain("pricing on vendor page");
    }
  });

  it("keeps the six core tool profiles decision-dense for launch", () => {
    const coreSlugs = [
      "zapier-ai",
      "make",
      "n8n",
      "clay",
      "relevance-ai",
      "lindy",
    ];
    const profiles = getFallbackToolProfiles().filter((profile) =>
      coreSlugs.includes(profile.slug),
    );

    expect(profiles).toHaveLength(coreSlugs.length);

    for (const profile of profiles) {
      expect(profile.highlights.length).toBeGreaterThanOrEqual(4);
      expect(profile.comparisonNotes.length).toBeGreaterThanOrEqual(4);

      for (const highlight of profile.highlights) {
        expect(highlight.length).toBeGreaterThan(24);
      }

      for (const note of profile.comparisonNotes) {
        expect(note.length).toBeGreaterThan(35);
      }
    }
  });
});
