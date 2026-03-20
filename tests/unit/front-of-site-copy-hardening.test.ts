import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/db");
  vi.doUnmock("../../lib/db");
});

describe("front-of-site copy hardening", () => {
  it("uses a launch-ready homepage blurb when a db tool lacks description", async () => {
    vi.doMock("@/lib/db", () => ({
      getDb: () => ({
        tool: {
          findMany: async () => [
            {
              slug: "custom-tool",
              name: "Custom Tool",
              tagline: null,
              description: null,
              updatedAt: new Date("2026-03-01T00:00:00.000Z"),
              categories: [],
              _count: {
                clickEvents: 0,
              },
            },
          ],
        },
        category: {
          findMany: async () => [],
        },
      }),
    }));

    const { getHomepageData } = await import("../../lib/homepage-data");
    const data = await getHomepageData();

    expect(data.featuredTools[0]?.blurb).toBe(
      "Operator-focused profile with setup context, pricing direction, and best-fit workflow notes.",
    );
  });

  it("uses launch-ready directory defaults when db values are missing", async () => {
    vi.doMock("../../lib/db", () => ({
      getDb: () => ({
        tool: {
          findMany: async () => [
            {
              id: "tool_1",
              slug: "custom-tool",
              name: "Custom Tool",
              tagline: null,
              description: null,
              websiteUrl: "https://example.com",
              updatedAt: new Date("2026-03-01T00:00:00.000Z"),
              setupMinutes: null,
              pricingFrom: null,
              currency: "USD",
              categories: [],
              affiliateLinks: [],
              _count: {
                clickEvents: 0,
              },
            },
          ],
        },
      }),
    }));

    const { getToolsDirectoryData } = await import("../../lib/tools-directory-data");
    const data = await getToolsDirectoryData();

    expect(data.tools[0]?.blurb).toBe(
      "Operator-focused profile with setup guidance, pricing context, and fit notes.",
    );
    expect(data.tools[0]?.setupLabel).toBe(
      "Setup depends on workflow depth and integrations",
    );
    expect(data.tools[0]?.pricingLabel).toBe(
      "See vendor pricing for current plans",
    );
  });

  it("uses a launch-ready tool profile fallback when db description is missing", async () => {
    vi.doMock("../../lib/db", () => ({
      getDb: () => ({
        tool: {
          findUnique: async () => ({
            slug: "custom-tool",
            name: "Custom Tool",
            tagline: null,
            description: null,
            websiteUrl: "https://example.com",
            setupMinutes: null,
            pricingFrom: null,
            currency: "USD",
            updatedAt: new Date("2026-03-01T00:00:00.000Z"),
            status: "ACTIVE",
            categories: [],
            affiliateLinks: [],
          }),
        },
      }),
    }));

    const { getToolProfileBySlug } = await import("../../lib/tool-profile-data");
    const profile = await getToolProfileBySlug("custom-tool");

    expect(profile?.description).toBe(
      "Operator-focused profile with practical setup notes, pricing context, and decision guidance.",
    );
    expect(profile?.setupLabel).toBe("Setup time depends on workflow complexity");
    expect(profile?.pricingLabel).toBe("Pricing details available on vendor site");
  });

  it("uses a launch-ready use-case tool blurb when db description is missing", async () => {
    vi.doMock("../../lib/db", () => ({
      getDb: () => ({
        category: {
          findUnique: async () => ({
            slug: "custom-ops",
            name: "Custom Ops",
            description: null,
            _count: {
              tools: 1,
            },
            tools: [
              {
                tool: {
                  id: "tool_1",
                  slug: "custom-tool",
                  name: "Custom Tool",
                  tagline: null,
                  description: null,
                  websiteUrl: "https://example.com",
                  affiliateLinks: [],
                },
              },
            ],
          }),
        },
      }),
    }));

    const { getUseCaseProfileBySlug } = await import("../../lib/use-case-data");
    const profile = await getUseCaseProfileBySlug("custom-ops");

    expect(profile?.tools[0]?.blurb).toBe(
      "Operator-ready summary covering fit, setup tradeoffs, and rollout context.",
    );
  });
});
