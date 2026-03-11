import { describe, expect, it } from "vitest";
import { LinkKind } from "@prisma/client";
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
});
