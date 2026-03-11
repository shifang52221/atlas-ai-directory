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
    });

    expect(href).toContain("/api/outbound?");
    expect(href).toContain("toolSlug=zapier-ai");
    expect(href).toContain("linkKind=AFFILIATE");
    expect(href).toContain("affiliateLinkId=link_1");
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
        },
        signature,
      );
      expect(isValid).toBe(true);
    }
  });
});
