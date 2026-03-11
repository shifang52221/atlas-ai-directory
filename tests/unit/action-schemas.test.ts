import { describe, expect, it } from "vitest";
import { LinkKind, SubmissionStatus, ToolStatus } from "@prisma/client";
import {
  parseAdminAffiliateBackfillForm,
  parseAdminAffiliateBackfillCorrectForm,
  parseAdminAffiliateBackfillDeleteForm,
  parseAdminAffiliateHubBatchActionForm,
  parseAdminAffiliateHubActionForm,
  parseAdminCategoryForm,
  parseAdminLoginForm,
  parseAdminSubmissionConvertForm,
  parseAdminSubmissionStatusForm,
  parseAdminToolCreateForm,
  parseAdminToolUpdateForm,
  parseSubmissionForm,
} from "../../lib/action-schemas";

function formDataFrom(
  entries: Record<string, string | number | undefined>,
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined) {
      form.set(key, String(value));
    }
  }
  return form;
}

describe("action schemas", () => {
  it("accepts valid submit form and rejects invalid url", () => {
    const ok = parseSubmissionForm(
      formDataFrom({
        contactEmail: "hello@example.com",
        toolName: "Example Tool",
        websiteUrl: "https://example.com",
        companyName: "Example Inc",
        message: "Hi",
      }),
    );
    expect(ok.success).toBe(true);

    const bad = parseSubmissionForm(
      formDataFrom({
        contactEmail: "hello@example.com",
        toolName: "Example Tool",
        websiteUrl: "invalid-url",
      }),
    );
    expect(bad.success).toBe(false);
  });

  it("validates admin login email and password", () => {
    const ok = parseAdminLoginForm(
      formDataFrom({
        email: "admin@atlas.local",
        password: "atlas-admin",
      }),
    );
    expect(ok.success).toBe(true);

    const bad = parseAdminLoginForm(
      formDataFrom({
        email: "not-email",
        password: "",
      }),
    );
    expect(bad.success).toBe(false);
  });

  it("validates admin tool create and update forms", () => {
    const createOk = parseAdminToolCreateForm(
      formDataFrom({
        name: "Zapier AI",
        slug: "zapier-ai",
        websiteUrl: "https://zapier.com",
        status: ToolStatus.ACTIVE,
        linkKind: LinkKind.AFFILIATE,
        setupMinutes: 30,
        pricingFrom: "19.99",
        currency: "USD",
        trackingUrl: "https://partner.example.com/zapier",
      }),
    );
    expect(createOk.success).toBe(true);

    const createBad = parseAdminToolCreateForm(
      formDataFrom({
        name: "",
        websiteUrl: "invalid-url",
        status: "UNKNOWN",
      }),
    );
    expect(createBad.success).toBe(false);

    const updateOk = parseAdminToolUpdateForm(
      formDataFrom({
        currentSlug: "zapier-ai",
        name: "Zapier AI",
        slug: "zapier-ai",
        websiteUrl: "https://zapier.com",
        status: ToolStatus.ACTIVE,
        linkKind: LinkKind.DIRECT,
      }),
    );
    expect(updateOk.success).toBe(true);

    const updateBad = parseAdminToolUpdateForm(
      formDataFrom({
        currentSlug: "",
        name: "Zapier AI",
        slug: "",
        websiteUrl: "invalid-url",
      }),
    );
    expect(updateBad.success).toBe(false);
  });

  it("validates admin category and submission forms", () => {
    const categoryOk = parseAdminCategoryForm(
      formDataFrom({
        name: "Support Automation",
        slug: "support-automation",
      }),
    );
    expect(categoryOk.success).toBe(true);

    const categoryBad = parseAdminCategoryForm(
      formDataFrom({
        name: "",
      }),
    );
    expect(categoryBad.success).toBe(false);

    const statusOk = parseAdminSubmissionStatusForm(
      formDataFrom({
        submissionId: "abc123",
        status: SubmissionStatus.APPROVED,
      }),
    );
    expect(statusOk.success).toBe(true);

    const statusBad = parseAdminSubmissionStatusForm(
      formDataFrom({
        submissionId: "",
        status: "UNKNOWN",
      }),
    );
    expect(statusBad.success).toBe(false);

    const convertOk = parseAdminSubmissionConvertForm(
      formDataFrom({
        submissionId: "abc123",
      }),
    );
    expect(convertOk.success).toBe(true);

    const convertBad = parseAdminSubmissionConvertForm(
      formDataFrom({
        submissionId: "",
      }),
    );
    expect(convertBad.success).toBe(false);
  });

  it("validates admin affiliate backfill form", () => {
    const ok = parseAdminAffiliateBackfillForm(
      formDataFrom({
        toolSlug: "zapier-ai",
        metricKind: "CONVERSION",
        count: 3,
        note: "network reconciliation",
        actionStatus: "TESTING",
        actionSort: "UPDATED_DESC",
      }),
    );
    expect(ok.success).toBe(true);

    const bad = parseAdminAffiliateBackfillForm(
      formDataFrom({
        toolSlug: "",
        metricKind: "UNKNOWN",
        count: 0,
      }),
    );
    expect(bad.success).toBe(false);

    const deleteOk = parseAdminAffiliateBackfillDeleteForm(
      formDataFrom({
        entryId: "123:tool:CONVERSION:1:9",
      }),
    );
    expect(deleteOk.success).toBe(true);

    const deleteBad = parseAdminAffiliateBackfillDeleteForm(
      formDataFrom({
        entryId: "",
      }),
    );
    expect(deleteBad.success).toBe(false);

    const correctOk = parseAdminAffiliateBackfillCorrectForm(
      formDataFrom({
        entryId: "123:tool:CONVERSION:1:9",
        toolSlug: "zapier-ai",
        metricKind: "CONVERSION",
        count: 8,
        note: "fix",
      }),
    );
    expect(correctOk.success).toBe(true);

    const correctBad = parseAdminAffiliateBackfillCorrectForm(
      formDataFrom({
        entryId: "",
        toolSlug: "",
        metricKind: "INVALID",
        count: 0,
      }),
    );
    expect(correctBad.success).toBe(false);

    const hubActionOk = parseAdminAffiliateHubActionForm(
      formDataFrom({
        pagePath: "/best-ai-automation-tools",
        status: "TESTING",
        note: "Reordered top picks",
        actionStatus: "UNVERIFIED",
        actionSort: "UPDATED_ASC",
      }),
    );
    expect(hubActionOk.success).toBe(true);

    const hubActionBad = parseAdminAffiliateHubActionForm(
      formDataFrom({
        pagePath: "",
        status: "INVALID",
      }),
    );
    expect(hubActionBad.success).toBe(false);

    const batchForm = new FormData();
    batchForm.append("pagePaths", "/best-ai-automation-tools");
    batchForm.append("pagePaths", "/best-ai-agents-for-sales");
    batchForm.set("status", "VERIFIED");
    batchForm.set("note", "batch-check");
    batchForm.set("actionStatus", "UNVERIFIED");
    batchForm.set("actionSort", "UPDATED_DESC");
    const batchOk = parseAdminAffiliateHubBatchActionForm(batchForm);
    expect(batchOk.success).toBe(true);
    if (batchOk.success) {
      expect(batchOk.data.pagePaths).toEqual([
        "/best-ai-automation-tools",
        "/best-ai-agents-for-sales",
      ]);
    }

    const batchBad = parseAdminAffiliateHubBatchActionForm(
      formDataFrom({
        status: "VERIFIED",
      }),
    );
    expect(batchBad.success).toBe(false);
  });
});
