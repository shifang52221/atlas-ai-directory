export type ToolReviewStatusValue = "DRAFT" | "IN_REVIEW" | "APPROVED";
export type ToolIndexingStatusValue = "NOINDEX" | "INDEX";
export type ToolEvidenceStatusValue = "MISSING" | "PARTIAL" | "COMPLETE";

export type ToolQualityBlocker =
  | "review_status"
  | "indexing_status"
  | "quality_score"
  | "evidence_status"
  | "author"
  | "reviewed_by"
  | "last_reviewed_at"
  | "change_summary";

export type ToolEditorialState = {
  reviewStatus?: ToolReviewStatusValue | null;
  indexingStatus?: ToolIndexingStatusValue | null;
  qualityScore?: number | null;
  evidenceStatus?: ToolEvidenceStatusValue | null;
  authorId?: string | null;
  reviewedById?: string | null;
  lastReviewedAt?: Date | string | null;
  changeSummary?: string | null;
};

export type ToolMonetizationPolicyInput = ToolEditorialState & {
  hasSufficientContent: boolean;
};

export const MINIMUM_TOOL_QUALITY_SCORE = 70;

function hasNonEmptyString(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

function hasReviewTimestamp(value?: Date | string | null): boolean {
  if (!value) {
    return false;
  }

  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function getToolQualityBlockers(
  input: ToolEditorialState,
): ToolQualityBlocker[] {
  const blockers: ToolQualityBlocker[] = [];

  if (input.reviewStatus !== "APPROVED") {
    blockers.push("review_status");
  }

  if (input.indexingStatus !== "INDEX") {
    blockers.push("indexing_status");
  }

  if ((input.qualityScore ?? 0) < MINIMUM_TOOL_QUALITY_SCORE) {
    blockers.push("quality_score");
  }

  if (input.evidenceStatus === "MISSING" || !input.evidenceStatus) {
    blockers.push("evidence_status");
  }

  if (!hasNonEmptyString(input.authorId)) {
    blockers.push("author");
  }

  if (!hasNonEmptyString(input.reviewedById)) {
    blockers.push("reviewed_by");
  }

  if (!hasReviewTimestamp(input.lastReviewedAt)) {
    blockers.push("last_reviewed_at");
  }

  if (!hasNonEmptyString(input.changeSummary)) {
    blockers.push("change_summary");
  }

  return blockers;
}

export function isToolEditoriallyApproved(input: ToolEditorialState): boolean {
  return getToolQualityBlockers({
    ...input,
    indexingStatus: "INDEX",
  }).filter((blocker) => blocker !== "indexing_status").length === 0;
}

export function isToolIndexable(input: ToolEditorialState): boolean {
  return getToolQualityBlockers(input).length === 0;
}

export function isToolMonetizationEligible(
  input: ToolMonetizationPolicyInput,
): boolean {
  return input.hasSufficientContent && isToolIndexable(input);
}
