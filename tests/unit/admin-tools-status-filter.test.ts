import { ToolStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  buildAdminToolDetailHref,
  buildAdminToolsBackHref,
  buildAdminToolsListHref,
  formatAdminToolsFilterLabel,
  parseAdminToolsStatusFilter,
} from "../../lib/admin-tools-status-filter";

describe("admin tools status filter helpers", () => {
  it("parses ACTIVE and INACTIVE filter values", () => {
    expect(parseAdminToolsStatusFilter("ACTIVE")).toBe(ToolStatus.ACTIVE);
    expect(parseAdminToolsStatusFilter("INACTIVE")).toBe(ToolStatus.INACTIVE);
    expect(parseAdminToolsStatusFilter("ARCHIVED")).toBeNull();
    expect(parseAdminToolsStatusFilter("")).toBeNull();
  });

  it("builds filtered updated redirect URL", () => {
    const href = buildAdminToolsListHref({
      statusFilter: ToolStatus.INACTIVE,
      updated: true,
    });

    expect(href).toBe("/admin/tools?status=INACTIVE&updated=1");
  });

  it("builds filtered error redirect URL", () => {
    const href = buildAdminToolsListHref({
      statusFilter: ToolStatus.ACTIVE,
      error: "status_failed",
    });

    expect(href).toBe("/admin/tools?status=ACTIVE&error=status_failed");
  });

  it("builds filtered created redirect URL", () => {
    const href = buildAdminToolsListHref({
      statusFilter: ToolStatus.INACTIVE,
      created: true,
    });

    expect(href).toBe("/admin/tools?status=INACTIVE&created=1");
  });

  it("builds filtered deleted redirect URL", () => {
    const href = buildAdminToolsListHref({
      statusFilter: ToolStatus.INACTIVE,
      deleted: true,
    });

    expect(href).toBe("/admin/tools?status=INACTIVE&deleted=1");
  });

  it("builds base list URL when no filter and no flash", () => {
    const href = buildAdminToolsListHref({
      statusFilter: null,
    });

    expect(href).toBe("/admin/tools");
  });

  it("builds back URL with current status filter", () => {
    const activeHref = buildAdminToolsBackHref(ToolStatus.ACTIVE);
    const noneHref = buildAdminToolsBackHref(null);

    expect(activeHref).toBe("/admin/tools?status=ACTIVE");
    expect(noneHref).toBe("/admin/tools");
  });

  it("builds tool detail URL with saved flash and status filter", () => {
    const href = buildAdminToolDetailHref({
      slug: "zapier-ai",
      statusFilter: ToolStatus.INACTIVE,
      saved: true,
    });

    expect(href).toBe("/admin/tools/zapier-ai?status=INACTIVE&saved=1");
  });

  it("builds tool detail URL with publish error and status filter", () => {
    const href = buildAdminToolDetailHref({
      slug: "n8n",
      statusFilter: ToolStatus.ACTIVE,
      publishErrorCodes: ["description", "primary_link"],
    });

    expect(href).toBe(
      "/admin/tools/n8n?status=ACTIVE&publish_error=description%2Cprimary_link",
    );
  });

  it("formats filter label only for ACTIVE/INACTIVE", () => {
    expect(formatAdminToolsFilterLabel(ToolStatus.ACTIVE)).toBe("Filter: ACTIVE");
    expect(formatAdminToolsFilterLabel(ToolStatus.INACTIVE)).toBe(
      "Filter: INACTIVE",
    );
    expect(formatAdminToolsFilterLabel(null)).toBeNull();
  });
});
