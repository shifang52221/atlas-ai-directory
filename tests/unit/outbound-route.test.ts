import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LinkKind } from "@prisma/client";
import { NextRequest } from "next/server";
import { buildOutboundSignature } from "../../lib/outbound-signature";

const mockTool = {
  id: "tool_1",
  slug: "zapier-ai",
  websiteUrl: "https://tool-home.example.com",
  affiliateLinks: [
    {
      id: "link_primary",
      trackingUrl: "https://partner.example.com/zapier",
      destinationUrl: "https://partner-destination.example.com/zapier",
    },
  ],
};

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/db");
});

describe("outbound route affiliate-link binding", () => {
  beforeEach(() => {
    process.env.OUTBOUND_SIGNING_SECRET = "test-signing-secret";
  });

  it("blocks signed requests when affiliateLinkId target does not belong to that link", async () => {
    vi.doMock("@/lib/db", () => ({
      getDb: () => ({
        tool: {
          findUnique: async () => mockTool,
        },
        clickEvent: {
          create: async () => null,
        },
      }),
    }));

    const { GET } = await import("../../app/api/outbound/route");
    const target = mockTool.websiteUrl;
    const signature = buildOutboundSignature({
      toolSlug: mockTool.slug,
      target,
      linkKind: LinkKind.AFFILIATE,
      sourcePath: `/tools/${mockTool.slug}`,
      affiliateLinkId: mockTool.affiliateLinks[0].id,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/outbound?${new URLSearchParams({
        toolSlug: mockTool.slug,
        target,
        linkKind: LinkKind.AFFILIATE,
        sourcePath: `/tools/${mockTool.slug}`,
        affiliateLinkId: mockTool.affiliateLinks[0].id,
        sig: signature,
      }).toString()}`,
    );

    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("/tools");
  });

  it("allows signed requests when affiliateLinkId target matches that link", async () => {
    vi.doMock("@/lib/db", () => ({
      getDb: () => ({
        tool: {
          findUnique: async () => mockTool,
        },
        clickEvent: {
          create: async () => null,
        },
      }),
    }));

    const { GET } = await import("../../app/api/outbound/route");
    const target = mockTool.affiliateLinks[0].trackingUrl;
    const signature = buildOutboundSignature({
      toolSlug: mockTool.slug,
      target,
      linkKind: LinkKind.AFFILIATE,
      sourcePath: `/tools/${mockTool.slug}`,
      affiliateLinkId: mockTool.affiliateLinks[0].id,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/outbound?${new URLSearchParams({
        toolSlug: mockTool.slug,
        target,
        linkKind: LinkKind.AFFILIATE,
        sourcePath: `/tools/${mockTool.slug}`,
        affiliateLinkId: mockTool.affiliateLinks[0].id,
        sig: signature,
      }).toString()}`,
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(target);
  });
});
