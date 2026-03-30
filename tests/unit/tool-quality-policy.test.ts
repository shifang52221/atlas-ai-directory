import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getToolQualityBlockers,
  isToolEditoriallyApproved,
  isToolIndexable,
  isToolMonetizationEligible,
} from "../../lib/tool-quality-policy";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/tool-profile-data");
});

const approvedToolState = {
  reviewStatus: "APPROVED" as const,
  indexingStatus: "INDEX" as const,
  qualityScore: 82,
  evidenceStatus: "COMPLETE" as const,
  authorId: "user_author",
  reviewedById: "user_reviewer",
  lastReviewedAt: new Date("2026-03-30T00:00:00.000Z"),
  changeSummary: "Expanded operator fit, pricing caveats, and review notes.",
};

describe("tool quality policy", () => {
  it("treats fully reviewed tools as indexable and monetization-ready", () => {
    expect(isToolEditoriallyApproved(approvedToolState)).toBe(true);
    expect(isToolIndexable(approvedToolState)).toBe(true);
    expect(
      isToolMonetizationEligible({
        ...approvedToolState,
        hasSufficientContent: true,
      }),
    ).toBe(true);
    expect(getToolQualityBlockers(approvedToolState)).toEqual([]);
    expect(
      isToolMonetizationEligible({
        ...approvedToolState,
        hasSufficientContent: false,
      }),
    ).toBe(false);
  });

  it("blocks indexing when review approval or evidence is missing", () => {
    const lowQuality = {
      ...approvedToolState,
      reviewStatus: "IN_REVIEW" as const,
      indexingStatus: "NOINDEX" as const,
      qualityScore: 58,
      evidenceStatus: "MISSING" as const,
      reviewedById: null,
      lastReviewedAt: null,
      changeSummary: "",
    };

    expect(isToolEditoriallyApproved(lowQuality)).toBe(false);
    expect(isToolIndexable(lowQuality)).toBe(false);
    expect(
      isToolMonetizationEligible({
        ...lowQuality,
        hasSufficientContent: true,
      }),
    ).toBe(false);
    expect(getToolQualityBlockers(lowQuality)).toEqual(
      expect.arrayContaining([
        "review_status",
        "indexing_status",
        "quality_score",
        "evidence_status",
        "reviewed_by",
        "last_reviewed_at",
        "change_summary",
      ]),
    );
  });
});

describe("tool detail metadata quality gate", () => {
  it("marks db-backed noindex tools with robots noindex,follow metadata", async () => {
    vi.doMock("@/lib/tool-profile-data", async () => {
      const actual = await vi.importActual<typeof import("@/lib/tool-profile-data")>(
        "@/lib/tool-profile-data",
      );

      return {
        ...actual,
      getToolProfileBySlug: async () => ({
        slug: "custom-tool",
        name: "Custom Tool",
        description:
          "Operator-grade profile for internal review before indexing is allowed.",
        indexingStatus: "NOINDEX",
        reviewStatus: "IN_REVIEW",
        qualityScore: 55,
        evidenceStatus: "PARTIAL",
        authorId: "author_1",
        reviewedById: null,
        lastReviewedAt: null,
        changeSummary: "",
      }),
      };
    });

    const { generateMetadata } = await import("../../app/tools/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "custom-tool" }),
    });

    expect(metadata.robots).toEqual({
      index: false,
      follow: true,
    });
  });
});
