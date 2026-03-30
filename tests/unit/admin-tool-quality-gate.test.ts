import { afterEach, describe, expect, it, vi } from "vitest";
import { LinkKind, ToolStatus } from "@prisma/client";

function formDataFrom(entries: Record<string, string | number | undefined>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined) {
      form.set(key, String(value));
    }
  }
  return form;
}

async function loadActionsWithDb(db: Record<string, unknown>) {
  const redirects: string[] = [];

  vi.doMock("@/lib/admin-auth", () => ({
    requireAdmin: async () => null,
  }));
  vi.doMock("@/lib/db", () => ({
    getDb: () => db,
  }));
  vi.doMock("next/cache", () => ({
    revalidatePath: () => undefined,
  }));
  vi.doMock("next/navigation", () => ({
    redirect: (url: string) => {
      redirects.push(url);
      const error = new Error("NEXT_REDIRECT") as Error & { digest: string };
      error.digest = `NEXT_REDIRECT;replace;${url};307;`;
      throw error;
    },
  }));

  const actions = await import("../../app/admin/(protected)/tools/actions");

  return {
    ...actions,
    redirects,
  };
}

async function expectRedirectSignal(promise: Promise<unknown>) {
  await expect(promise).rejects.toMatchObject({
    digest: expect.stringContaining("NEXT_REDIRECT"),
  });
}

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/admin-auth");
  vi.doUnmock("@/lib/db");
  vi.doUnmock("next/cache");
  vi.doUnmock("next/navigation");
});

describe("admin tool quality gate", () => {
  it("creates new tools with conservative quality defaults", async () => {
    let createInput: Record<string, unknown> | null = null;

    const db = {
      tool: {
        create: async (input: Record<string, unknown>) => {
          createInput = input;
          return { id: "tool_1", slug: "custom-tool" };
        },
      },
      category: {
        upsert: async () => ({ id: "category_1" }),
      },
      toolCategory: {
        deleteMany: async () => null,
        createMany: async () => null,
      },
      affiliateLink: {
        findFirst: async () => null,
      },
    };

    const { createToolAction } = await loadActionsWithDb(db);

    await expectRedirectSignal(
      createToolAction(
        formDataFrom({
          name: "Custom Tool",
          slug: "custom-tool",
          websiteUrl: "https://example.com",
          status: ToolStatus.ACTIVE,
          linkKind: LinkKind.DIRECT,
          currency: "USD",
          categories: "Automation",
        }),
      ),
    );

    expect(createInput).toMatchObject({
      data: expect.objectContaining({
        reviewStatus: "DRAFT",
        indexingStatus: "NOINDEX",
        qualityScore: 0,
        evidenceStatus: "MISSING",
      }),
    });
  });

  it("persists editorial quality fields on tool update", async () => {
    let updateInput: Record<string, unknown> | null = null;

    const db = {
      tool: {
        update: async (input: Record<string, unknown>) => {
          updateInput = input;
          return { id: "tool_1", slug: "custom-tool" };
        },
      },
      category: {
        upsert: async () => ({ id: "category_1" }),
      },
      toolCategory: {
        deleteMany: async () => null,
        createMany: async () => null,
      },
      affiliateLink: {
        findFirst: async () => null,
      },
    };

    const { updateToolAction } = await loadActionsWithDb(db);

    await expectRedirectSignal(
      updateToolAction(
        formDataFrom({
          currentSlug: "custom-tool",
          name: "Custom Tool",
          slug: "custom-tool",
          websiteUrl: "https://example.com",
          status: ToolStatus.ACTIVE,
          linkKind: LinkKind.DIRECT,
          currency: "USD",
          categories: "Automation",
          reviewStatus: "APPROVED",
          indexingStatus: "INDEX",
          qualityScore: 82,
          evidenceStatus: "COMPLETE",
          authorId: "user_author",
          reviewedById: "user_reviewer",
          lastReviewedAt: "2026-03-30",
          changeSummary: "Expanded decision guidance and evidence notes.",
        }),
      ),
    );

    expect(updateInput).toMatchObject({
      data: expect.objectContaining({
        reviewStatus: "APPROVED",
        indexingStatus: "INDEX",
        qualityScore: 82,
        evidenceStatus: "COMPLETE",
        authorId: "user_author",
        reviewedById: "user_reviewer",
        changeSummary: "Expanded decision guidance and evidence notes.",
      }),
    });
  });

  it("reports editorial publish blockers before allowing indexing-ready publication", async () => {
    const db = {
      tool: {
        findUnique: async () => ({
          id: "tool_1",
          slug: "custom-tool",
          name: "Custom Tool",
          websiteUrl: "https://example.com",
          description: "A real description that passes the basic publish gate.",
          reviewStatus: "IN_REVIEW",
          indexingStatus: "NOINDEX",
          qualityScore: 58,
          evidenceStatus: "MISSING",
          authorId: "user_author",
          reviewedById: null,
          lastReviewedAt: null,
          changeSummary: "",
          categories: [
            {
              category: {
                slug: "automation",
              },
            },
          ],
          affiliateLinks: [
            {
              trackingUrl: "https://partner.example.com/custom-tool",
            },
          ],
        }),
        update: async () => null,
      },
    };

    const { publishToolAction, redirects } = await loadActionsWithDb(db);

    await expectRedirectSignal(
      publishToolAction(
        formDataFrom({
          slug: "custom-tool",
        }),
      ),
    );

    expect(redirects.at(-1)).toContain("/admin/tools/custom-tool?");
    expect(redirects.at(-1)).toContain("publish_error=");
    expect(redirects.at(-1)).toContain("review_status");
    expect(redirects.at(-1)).toContain("indexing_status");
    expect(redirects.at(-1)).toContain("quality_score");
    expect(redirects.at(-1)).toContain("evidence_status");
    expect(redirects.at(-1)).toContain("reviewed_by");
    expect(redirects.at(-1)).toContain("last_reviewed_at");
    expect(redirects.at(-1)).toContain("change_summary");
  });
});
