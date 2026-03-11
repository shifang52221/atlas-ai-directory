import { ToolStatus } from "@prisma/client";

export function parseAdminToolsStatusFilter(
  value: string | null | undefined,
): ToolStatus | null {
  if (value === ToolStatus.ACTIVE) {
    return ToolStatus.ACTIVE;
  }
  if (value === ToolStatus.INACTIVE) {
    return ToolStatus.INACTIVE;
  }
  return null;
}

type AdminToolsListHrefOptions = {
  statusFilter: ToolStatus | null;
  created?: boolean;
  deleted?: boolean;
  updated?: boolean;
  error?: string;
};

export function buildAdminToolsListHref(
  options: AdminToolsListHrefOptions,
): string {
  const params = new URLSearchParams();

  if (options.statusFilter) {
    params.set("status", options.statusFilter);
  }
  if (options.created) {
    params.set("created", "1");
  }
  if (options.deleted) {
    params.set("deleted", "1");
  }
  if (options.updated) {
    params.set("updated", "1");
  }
  if (options.error) {
    params.set("error", options.error);
  }

  const query = params.toString();
  if (!query) {
    return "/admin/tools";
  }
  return `/admin/tools?${query}`;
}

export function buildAdminToolsBackHref(statusFilter: ToolStatus | null): string {
  return buildAdminToolsListHref({
    statusFilter,
  });
}

type AdminToolDetailHrefOptions = {
  slug: string;
  statusFilter: ToolStatus | null;
  saved?: boolean;
  published?: boolean;
  error?: string;
  publishErrorCodes?: string[];
};

export function buildAdminToolDetailHref(
  options: AdminToolDetailHrefOptions,
): string {
  if (!options.slug) {
    return buildAdminToolsListHref({
      statusFilter: options.statusFilter,
      error: options.error,
    });
  }

  const params = new URLSearchParams();
  if (options.statusFilter) {
    params.set("status", options.statusFilter);
  }
  if (options.saved) {
    params.set("saved", "1");
  }
  if (options.published) {
    params.set("published", "1");
  }
  if (options.error) {
    params.set("error", options.error);
  }
  if (options.publishErrorCodes && options.publishErrorCodes.length > 0) {
    params.set("publish_error", options.publishErrorCodes.join(","));
  }

  const query = params.toString();
  if (!query) {
    return `/admin/tools/${options.slug}`;
  }
  return `/admin/tools/${options.slug}?${query}`;
}

export function formatAdminToolsFilterLabel(
  statusFilter: ToolStatus | null,
): string | null {
  if (!statusFilter) {
    return null;
  }
  return `Filter: ${statusFilter}`;
}
