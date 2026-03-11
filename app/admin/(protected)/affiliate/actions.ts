"use server";

import { redirect } from "next/navigation";
import {
  parseAdminAffiliateBackfillCorrectForm,
  parseAdminAffiliateBackfillDeleteForm,
  parseAdminAffiliateBackfillForm,
  parseAdminAffiliateHubBatchActionForm,
  parseAdminAffiliateHubActionForm,
} from "@/lib/action-schemas";
import {
  auditAffiliateHubActionStatus,
  auditAffiliateManualMetric,
  correctAffiliateManualMetricById,
  deleteAffiliateManualMetricById,
} from "@/lib/affiliate-performance";

function buildAffiliateRedirectHref(input: {
  window?: string;
  tool?: string;
  hub?: string;
  historyPage?: number;
  historyTool?: string;
  historyKind?: "ALL" | "IMPRESSION" | "CONVERSION";
  actionStatus?: "ALL" | "UNVERIFIED" | "TODO" | "TESTING" | "VERIFIED" | "DISMISSED";
  actionSort?: "UPDATED_DESC" | "UPDATED_ASC";
  saved?: string;
  deleted?: string;
  corrected?: string;
  hubActionSaved?: string;
  hubActionBatchSaved?: string;
  hubActionBatchCount?: number;
  error?: string;
}): string {
  const params = new URLSearchParams();

  if (input.window) {
    params.set("window", input.window);
  }
  if (input.tool) {
    params.set("tool", input.tool);
  }
  if (input.hub) {
    params.set("hub", input.hub);
  }
  if (input.historyPage && input.historyPage > 1) {
    params.set("historyPage", String(input.historyPage));
  }
  if (input.historyTool) {
    params.set("historyTool", input.historyTool);
  }
  if (input.historyKind && input.historyKind !== "ALL") {
    params.set("historyKind", input.historyKind);
  }
  if (input.actionStatus && input.actionStatus !== "ALL") {
    params.set("actionStatus", input.actionStatus);
  }
  if (input.actionSort && input.actionSort !== "UPDATED_DESC") {
    params.set("actionSort", input.actionSort);
  }
  if (input.saved) {
    params.set("saved", input.saved);
  }
  if (input.deleted) {
    params.set("deleted", input.deleted);
  }
  if (input.corrected) {
    params.set("corrected", input.corrected);
  }
  if (input.hubActionSaved) {
    params.set("hubActionSaved", input.hubActionSaved);
  }
  if (input.hubActionBatchSaved) {
    params.set("hubActionBatchSaved", input.hubActionBatchSaved);
  }
  if (input.hubActionBatchCount && input.hubActionBatchCount > 0) {
    params.set("hubActionBatchCount", String(input.hubActionBatchCount));
  }
  if (input.error) {
    params.set("error", input.error);
  }

  const query = params.toString();
  return query ? `/admin/affiliate?${query}` : "/admin/affiliate";
}

export async function recordAffiliateBackfillAction(formData: FormData) {
  const parsed = parseAdminAffiliateBackfillForm(formData);
  if (!parsed.success) {
    const window = String(formData.get("window") || "7d").trim() || "7d";
    const hub = String(formData.get("hub") || "").trim() || undefined;
    redirect(
      buildAffiliateRedirectHref({
        window,
        hub,
        actionStatus:
          String(formData.get("actionStatus") || "").trim() === "UNVERIFIED" ||
          String(formData.get("actionStatus") || "").trim() === "TODO" ||
          String(formData.get("actionStatus") || "").trim() === "TESTING" ||
          String(formData.get("actionStatus") || "").trim() === "VERIFIED" ||
          String(formData.get("actionStatus") || "").trim() === "DISMISSED" ||
          String(formData.get("actionStatus") || "").trim() === "ALL"
            ? (String(formData.get("actionStatus") || "").trim() as
                | "ALL"
                | "UNVERIFIED"
                | "TODO"
                | "TESTING"
                | "VERIFIED"
                | "DISMISSED")
            : undefined,
        actionSort:
          String(formData.get("actionSort") || "").trim() === "UPDATED_ASC" ||
          String(formData.get("actionSort") || "").trim() === "UPDATED_DESC"
            ? (String(formData.get("actionSort") || "").trim() as
                | "UPDATED_DESC"
                | "UPDATED_ASC")
            : undefined,
        error: "validation",
      }),
    );
  }

  const data = parsed.data;
  await auditAffiliateManualMetric({
    toolSlug: data.toolSlug,
    kind: data.metricKind,
    count: data.count,
    note: data.note,
  });

  const window = data.window || "7d";
  redirect(
    buildAffiliateRedirectHref({
      window,
      hub: data.hub,
      actionStatus: data.actionStatus,
      actionSort: data.actionSort,
      saved: "1",
    }),
  );
}

export async function deleteAffiliateBackfillEntryAction(formData: FormData) {
  const parsed = parseAdminAffiliateBackfillDeleteForm(formData);
  if (!parsed.success) {
    const window = String(formData.get("window") || "7d").trim() || "7d";
    const hub = String(formData.get("hub") || "").trim() || undefined;
    redirect(
      buildAffiliateRedirectHref({
        window,
        hub,
        actionStatus:
          String(formData.get("actionStatus") || "").trim() === "UNVERIFIED" ||
          String(formData.get("actionStatus") || "").trim() === "TODO" ||
          String(formData.get("actionStatus") || "").trim() === "TESTING" ||
          String(formData.get("actionStatus") || "").trim() === "VERIFIED" ||
          String(formData.get("actionStatus") || "").trim() === "DISMISSED" ||
          String(formData.get("actionStatus") || "").trim() === "ALL"
            ? (String(formData.get("actionStatus") || "").trim() as
                | "ALL"
                | "UNVERIFIED"
                | "TODO"
                | "TESTING"
                | "VERIFIED"
                | "DISMISSED")
            : undefined,
        actionSort:
          String(formData.get("actionSort") || "").trim() === "UPDATED_ASC" ||
          String(formData.get("actionSort") || "").trim() === "UPDATED_DESC"
            ? (String(formData.get("actionSort") || "").trim() as
                | "UPDATED_DESC"
                | "UPDATED_ASC")
            : undefined,
        error: "validation",
      }),
    );
  }

  const data = parsed.data;
  const deleted = await deleteAffiliateManualMetricById(data.entryId);
  redirect(
    buildAffiliateRedirectHref({
      window: data.window || "7d",
      tool: data.tool,
      hub: data.hub,
      historyPage: data.historyPage,
      historyTool: data.historyTool,
      historyKind: data.historyKind,
      actionStatus: data.actionStatus,
      actionSort: data.actionSort,
      deleted: deleted ? "1" : undefined,
      error: deleted ? undefined : "not_found",
    }),
  );
}

export async function correctAffiliateBackfillEntryAction(formData: FormData) {
  const parsed = parseAdminAffiliateBackfillCorrectForm(formData);
  if (!parsed.success) {
    const window = String(formData.get("window") || "7d").trim() || "7d";
    const hub = String(formData.get("hub") || "").trim() || undefined;
    redirect(
      buildAffiliateRedirectHref({
        window,
        hub,
        actionStatus:
          String(formData.get("actionStatus") || "").trim() === "UNVERIFIED" ||
          String(formData.get("actionStatus") || "").trim() === "TODO" ||
          String(formData.get("actionStatus") || "").trim() === "TESTING" ||
          String(formData.get("actionStatus") || "").trim() === "VERIFIED" ||
          String(formData.get("actionStatus") || "").trim() === "DISMISSED" ||
          String(formData.get("actionStatus") || "").trim() === "ALL"
            ? (String(formData.get("actionStatus") || "").trim() as
                | "ALL"
                | "UNVERIFIED"
                | "TODO"
                | "TESTING"
                | "VERIFIED"
                | "DISMISSED")
            : undefined,
        actionSort:
          String(formData.get("actionSort") || "").trim() === "UPDATED_ASC" ||
          String(formData.get("actionSort") || "").trim() === "UPDATED_DESC"
            ? (String(formData.get("actionSort") || "").trim() as
                | "UPDATED_DESC"
                | "UPDATED_ASC")
            : undefined,
        error: "validation",
      }),
    );
  }

  const data = parsed.data;
  const corrected = await correctAffiliateManualMetricById(data.entryId, {
    toolSlug: data.toolSlug,
    kind: data.metricKind,
    count: data.count,
    note: data.note,
  });
  redirect(
    buildAffiliateRedirectHref({
      window: data.window || "7d",
      tool: data.tool,
      hub: data.hub,
      historyPage: data.historyPage,
      historyTool: data.historyTool,
      historyKind: data.historyKind,
      actionStatus: data.actionStatus,
      actionSort: data.actionSort,
      corrected: corrected ? "1" : undefined,
      error: corrected ? undefined : "not_found",
    }),
  );
}

export async function recordAffiliateHubActionStatusAction(formData: FormData) {
  const parsed = parseAdminAffiliateHubActionForm(formData);
  if (!parsed.success) {
    const window = String(formData.get("window") || "7d").trim() || "7d";
    const tool = String(formData.get("tool") || "").trim() || undefined;
    const hub = String(formData.get("hub") || "").trim() || undefined;
    const historyPage = Number.parseInt(
      String(formData.get("historyPage") || "").trim(),
      10,
    );
    const historyTool = String(formData.get("historyTool") || "").trim() || undefined;
    const historyKindRaw = String(formData.get("historyKind") || "").trim();
    const historyKind =
      historyKindRaw === "ALL" ||
      historyKindRaw === "IMPRESSION" ||
      historyKindRaw === "CONVERSION"
        ? historyKindRaw
        : undefined;
    const actionStatusRaw = String(formData.get("actionStatus") || "").trim();
    const actionStatus =
      actionStatusRaw === "ALL" ||
      actionStatusRaw === "UNVERIFIED" ||
      actionStatusRaw === "TODO" ||
      actionStatusRaw === "TESTING" ||
      actionStatusRaw === "VERIFIED" ||
      actionStatusRaw === "DISMISSED"
        ? actionStatusRaw
        : undefined;
    const actionSortRaw = String(formData.get("actionSort") || "").trim();
    const actionSort =
      actionSortRaw === "UPDATED_DESC" || actionSortRaw === "UPDATED_ASC"
        ? actionSortRaw
        : undefined;

    redirect(
      buildAffiliateRedirectHref({
        window,
        tool,
        hub,
        historyPage: Number.isFinite(historyPage) ? historyPage : undefined,
        historyTool,
        historyKind,
        actionStatus,
        actionSort,
        error: "validation",
      }),
    );
  }

  const data = parsed.data;
  await auditAffiliateHubActionStatus({
    pagePath: data.pagePath,
    status: data.status,
    note: data.note,
  });

  redirect(
    buildAffiliateRedirectHref({
      window: data.window || "7d",
      tool: data.tool,
      hub: data.hub,
      historyPage: data.historyPage,
      historyTool: data.historyTool,
      historyKind: data.historyKind,
      actionStatus: data.actionStatus,
      actionSort: data.actionSort,
      hubActionSaved: "1",
    }),
  );
}

export async function recordAffiliateHubBatchStatusAction(formData: FormData) {
  const parsed = parseAdminAffiliateHubBatchActionForm(formData);
  if (!parsed.success) {
    const window = String(formData.get("window") || "7d").trim() || "7d";
    const tool = String(formData.get("tool") || "").trim() || undefined;
    const hub = String(formData.get("hub") || "").trim() || undefined;
    const historyPage = Number.parseInt(
      String(formData.get("historyPage") || "").trim(),
      10,
    );
    const historyTool = String(formData.get("historyTool") || "").trim() || undefined;
    const historyKindRaw = String(formData.get("historyKind") || "").trim();
    const historyKind =
      historyKindRaw === "ALL" ||
      historyKindRaw === "IMPRESSION" ||
      historyKindRaw === "CONVERSION"
        ? historyKindRaw
        : undefined;
    const actionStatusRaw = String(formData.get("actionStatus") || "").trim();
    const actionStatus =
      actionStatusRaw === "ALL" ||
      actionStatusRaw === "UNVERIFIED" ||
      actionStatusRaw === "TODO" ||
      actionStatusRaw === "TESTING" ||
      actionStatusRaw === "VERIFIED" ||
      actionStatusRaw === "DISMISSED"
        ? actionStatusRaw
        : undefined;
    const actionSortRaw = String(formData.get("actionSort") || "").trim();
    const actionSort =
      actionSortRaw === "UPDATED_DESC" || actionSortRaw === "UPDATED_ASC"
        ? actionSortRaw
        : undefined;

    redirect(
      buildAffiliateRedirectHref({
        window,
        tool,
        hub,
        historyPage: Number.isFinite(historyPage) ? historyPage : undefined,
        historyTool,
        historyKind,
        actionStatus,
        actionSort,
        error: "validation",
      }),
    );
  }

  const data = parsed.data;
  const uniquePaths = Array.from(new Set(data.pagePaths));
  await Promise.all(
    uniquePaths.map((pagePath) =>
      auditAffiliateHubActionStatus({
        pagePath,
        status: data.status,
        note: data.note,
      }),
    ),
  );

  redirect(
    buildAffiliateRedirectHref({
      window: data.window || "7d",
      tool: data.tool,
      hub: data.hub,
      historyPage: data.historyPage,
      historyTool: data.historyTool,
      historyKind: data.historyKind,
      actionStatus: data.status,
      actionSort: data.actionSort,
      hubActionBatchSaved: "1",
      hubActionBatchCount: uniquePaths.length,
    }),
  );
}
