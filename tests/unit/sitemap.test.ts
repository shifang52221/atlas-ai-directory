import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/db");
});

describe("sitemap quality gate", () => {
  it("includes only active indexable db tools in sitemap output", async () => {
    let toolQuery: Record<string, unknown> | null = null;

    vi.doMock("@/lib/db", () => ({
      getDb: () => ({
        tool: {
          findMany: async (query: Record<string, unknown>) => {
            toolQuery = query;
            const where = query.where as
              | { status?: string; indexingStatus?: string }
              | undefined;
            if (
              where?.status === "ACTIVE" &&
              where.indexingStatus === "INDEX"
            ) {
              return [{ slug: "indexable-tool" }];
            }
            return [
              { slug: "indexable-tool" },
              { slug: "noindex-tool" },
              { slug: "inactive-tool" },
            ];
          },
        },
        category: {
          findMany: async () => [
            { slug: "automation" },
          ],
        },
      }),
    }));

    const { default: sitemap } = await import("../../app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(toolQuery).toMatchObject({
      where: {
        status: "ACTIVE",
        indexingStatus: "INDEX",
      },
    });
    expect(urls).toContain("http://localhost:3000/tools/indexable-tool");
    expect(urls).not.toContain("http://localhost:3000/tools/noindex-tool");
    expect(urls).not.toContain("http://localhost:3000/tools/inactive-tool");
  });

  it("falls back to launch profiles only when db access is unavailable", async () => {
    vi.doMock("@/lib/db", () => ({
      getDb: () => ({
        tool: {
          findMany: async () => {
            throw new Error("db unavailable");
          },
        },
        category: {
          findMany: async () => {
            throw new Error("db unavailable");
          },
        },
      }),
    }));

    const { default: sitemap } = await import("../../app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/tools/zapier-ai");
    expect(urls).toContain("http://localhost:3000/tools/make");
  });
});
