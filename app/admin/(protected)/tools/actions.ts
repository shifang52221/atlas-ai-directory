"use server";

import { LinkKind, ToolStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseAdminToolCreateForm,
  parseAdminToolDeleteForm,
  parseAdminToolPublishForm,
  parseAdminToolStatusForm,
  parseAdminToolUpdateForm,
} from "@/lib/action-schemas";
import { requireAdmin } from "@/lib/admin-auth";
import {
  buildAdminToolDetailHref,
  buildAdminToolsListHref,
  parseAdminToolsStatusFilter,
} from "@/lib/admin-tools-status-filter";
import { getDb } from "@/lib/db";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveCategoryIds(rawCategories: string): Promise<string[]> {
  const db = getDb();
  const names = Array.from(
    new Set(
      rawCategories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

  const ids: string[] = [];

  for (const name of names) {
    const slug = slugify(name);
    if (!slug) {
      continue;
    }

    const category = await db.category.upsert({
      where: { slug },
      update: { name },
      create: {
        slug,
        name,
      },
      select: { id: true },
    });

    ids.push(category.id);
  }

  return ids;
}

async function syncToolCategories(toolId: string, categoryIds: string[]) {
  const db = getDb();
  await db.toolCategory.deleteMany({
    where: { toolId },
  });

  if (categoryIds.length > 0) {
    await db.toolCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        toolId,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }
}

async function syncPrimaryAffiliateLink(params: {
  toolId: string;
  websiteUrl: string;
  trackingUrl: string;
  linkKind: LinkKind;
}) {
  const db = getDb();
  const existing = await db.affiliateLink.findFirst({
    where: {
      toolId: params.toolId,
      isPrimary: true,
    },
    select: {
      id: true,
    },
  });

  const trackingUrl = params.trackingUrl.trim();

  if (!trackingUrl) {
    if (existing) {
      await db.affiliateLink.delete({
        where: {
          id: existing.id,
        },
      });
    }
    return;
  }

  if (existing) {
    await db.affiliateLink.update({
      where: { id: existing.id },
      data: {
        linkKind: params.linkKind,
        destinationUrl: params.websiteUrl,
        trackingUrl,
      },
    });
    return;
  }

  await db.affiliateLink.create({
    data: {
      toolId: params.toolId,
      linkKind: params.linkKind,
      isPrimary: true,
      destinationUrl: params.websiteUrl,
      trackingUrl,
      region: "global",
    },
  });
}

function revalidateSitePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath("/");
  revalidatePath("/use-cases");
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

type PublishMissingCode =
  | "name"
  | "website_url"
  | "description"
  | "categories"
  | "primary_link";

function collectPublishMissingItems(input: {
  name: string;
  websiteUrl: string;
  description: string | null;
  categoryCount: number;
  primaryTrackingUrl: string | null;
}): PublishMissingCode[] {
  const missing: PublishMissingCode[] = [];

  if (!input.name.trim()) {
    missing.push("name");
  }
  if (!isValidHttpUrl(input.websiteUrl)) {
    missing.push("website_url");
  }
  if (!input.description || !input.description.trim()) {
    missing.push("description");
  }
  if (input.categoryCount <= 0) {
    missing.push("categories");
  }
  if (!input.primaryTrackingUrl || !isValidHttpUrl(input.primaryTrackingUrl)) {
    missing.push("primary_link");
  }

  return missing;
}

export async function createToolAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseAdminToolCreateForm(formData);
  if (!parsed.success) {
    const fallbackStatusFilter = parseAdminToolsStatusFilter(
      String(formData.get("currentStatusFilter") || ""),
    );
    redirect(
      buildAdminToolsListHref({
        statusFilter: fallbackStatusFilter,
        error: "invalid_form",
      }),
    );
  }

  const db = getDb();
  const name = parsed.data.name;
  const inputSlug = parsed.data.slug || "";
  const slug = slugify(inputSlug || name);
  const websiteUrl = parsed.data.websiteUrl;
  const currentStatusFilter = parseAdminToolsStatusFilter(
    parsed.data.currentStatusFilter || "",
  );

  if (!name || !slug || !websiteUrl) {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "missing_required",
      }),
    );
  }

  if (!isValidHttpUrl(websiteUrl)) {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "invalid_url",
      }),
    );
  }

  const tagline = parsed.data.tagline || "";
  const description = parsed.data.description || "";
  const status = parsed.data.status;
  const setupMinutes = parsed.data.setupMinutes ?? null;
  const pricingFrom = parsed.data.pricingFrom ?? null;
  const currency = parsed.data.currency;
  const categories = parsed.data.categories || "";
  const trackingUrl = parsed.data.trackingUrl || "";
  const linkKind = parsed.data.linkKind;

  try {
    const created = await db.tool.create({
      data: {
        slug,
        name,
        tagline: tagline || null,
        websiteUrl,
        description: description || null,
        status,
        setupMinutes,
        pricingFrom,
        currency,
      },
      select: { id: true, slug: true },
    });

    const categoryIds = await resolveCategoryIds(categories);
    await syncToolCategories(created.id, categoryIds);
    await syncPrimaryAffiliateLink({
      toolId: created.id,
      websiteUrl,
      trackingUrl,
      linkKind,
    });

    revalidateSitePaths();
    revalidatePath(`/tools/${created.slug}`);
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        created: true,
      }),
    );
  } catch {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "create_failed",
      }),
    );
  }
}

export async function toggleToolStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseAdminToolStatusForm(formData);
  if (!parsed.success) {
    const fallbackStatusFilter = parseAdminToolsStatusFilter(
      String(formData.get("currentStatusFilter") || ""),
    );
    redirect(
      buildAdminToolsListHref({
        statusFilter: fallbackStatusFilter,
        error: "invalid_form",
      }),
    );
  }

  const db = getDb();
  const slug = parsed.data.slug;
  const nextStatus = parsed.data.nextStatus;
  const currentStatusFilter = parseAdminToolsStatusFilter(
    parsed.data.currentStatusFilter || "",
  );

  if (!slug) {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "missing_slug",
      }),
    );
  }

  try {
    await db.tool.update({
      where: { slug },
      data: { status: nextStatus },
    });

    revalidateSitePaths();
    revalidatePath(`/tools/${slug}`);
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        updated: true,
      }),
    );
  } catch {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "status_failed",
      }),
    );
  }
}

export async function updateToolAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseAdminToolUpdateForm(formData);
  if (!parsed.success) {
    const fallbackSlug = String(formData.get("currentSlug") || "").trim();
    const fallbackStatusFilter = parseAdminToolsStatusFilter(
      String(formData.get("currentStatusFilter") || ""),
    );
    redirect(
      buildAdminToolDetailHref({
        slug: fallbackSlug,
        statusFilter: fallbackStatusFilter,
        error: "invalid_form",
      }),
    );
  }

  const db = getDb();
  const currentSlug = parsed.data.currentSlug;
  const currentStatusFilter = parseAdminToolsStatusFilter(
    parsed.data.currentStatusFilter || "",
  );
  const name = parsed.data.name;
  const inputSlug = parsed.data.slug || "";
  const nextSlug = slugify(inputSlug || name);
  const websiteUrl = parsed.data.websiteUrl;

  if (!currentSlug || !name || !nextSlug || !websiteUrl) {
    redirect(
      buildAdminToolDetailHref({
        slug: currentSlug,
        statusFilter: currentStatusFilter,
        error: "missing_required",
      }),
    );
  }

  if (!isValidHttpUrl(websiteUrl)) {
    redirect(
      buildAdminToolDetailHref({
        slug: currentSlug,
        statusFilter: currentStatusFilter,
        error: "invalid_url",
      }),
    );
  }

  const tagline = parsed.data.tagline || "";
  const description = parsed.data.description || "";
  const status = parsed.data.status;
  const setupMinutes = parsed.data.setupMinutes ?? null;
  const pricingFrom = parsed.data.pricingFrom ?? null;
  const currency = parsed.data.currency;
  const categories = parsed.data.categories || "";
  const trackingUrl = parsed.data.trackingUrl || "";
  const linkKind = parsed.data.linkKind;

  try {
    const updated = await db.tool.update({
      where: { slug: currentSlug },
      data: {
        slug: nextSlug,
        name,
        tagline: tagline || null,
        websiteUrl,
        description: description || null,
        status,
        setupMinutes,
        pricingFrom,
        currency,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    const categoryIds = await resolveCategoryIds(categories);
    await syncToolCategories(updated.id, categoryIds);
    await syncPrimaryAffiliateLink({
      toolId: updated.id,
      websiteUrl,
      trackingUrl,
      linkKind,
    });

    revalidateSitePaths();
    revalidatePath(`/tools/${currentSlug}`);
    revalidatePath(`/tools/${updated.slug}`);
    redirect(
      buildAdminToolDetailHref({
        slug: updated.slug,
        statusFilter: currentStatusFilter,
        saved: true,
      }),
    );
  } catch {
    redirect(
      buildAdminToolDetailHref({
        slug: currentSlug,
        statusFilter: currentStatusFilter,
        error: "update_failed",
      }),
    );
  }
}

export async function deleteToolAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseAdminToolDeleteForm(formData);
  if (!parsed.success) {
    const fallbackStatusFilter = parseAdminToolsStatusFilter(
      String(formData.get("currentStatusFilter") || ""),
    );
    redirect(
      buildAdminToolsListHref({
        statusFilter: fallbackStatusFilter,
        error: "invalid_form",
      }),
    );
  }

  const db = getDb();
  const slug = parsed.data.slug;
  const currentStatusFilter = parseAdminToolsStatusFilter(
    parsed.data.currentStatusFilter || "",
  );

  if (!slug) {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "missing_slug",
      }),
    );
  }

  try {
    await db.tool.delete({
      where: { slug },
    });

    revalidateSitePaths();
    revalidatePath(`/tools/${slug}`);
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        deleted: true,
      }),
    );
  } catch {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "delete_failed",
      }),
    );
  }
}

export async function publishToolAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseAdminToolPublishForm(formData);
  if (!parsed.success) {
    const fallbackStatusFilter = parseAdminToolsStatusFilter(
      String(formData.get("currentStatusFilter") || ""),
    );
    const fallbackSlug = String(formData.get("slug") || "").trim();
    redirect(
      buildAdminToolDetailHref({
        slug: fallbackSlug,
        statusFilter: fallbackStatusFilter,
        error: "invalid_form",
      }),
    );
  }

  const db = getDb();
  const slug = parsed.data.slug;
  const currentStatusFilter = parseAdminToolsStatusFilter(
    parsed.data.currentStatusFilter || "",
  );
  if (!slug) {
    redirect(
      buildAdminToolsListHref({
        statusFilter: currentStatusFilter,
        error: "missing_slug",
      }),
    );
  }

  try {
    const tool = await db.tool.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        websiteUrl: true,
        description: true,
        categories: {
          select: {
            category: {
              select: {
                slug: true,
              },
            },
          },
        },
        affiliateLinks: {
          where: { isPrimary: true },
          take: 1,
          select: {
            trackingUrl: true,
          },
        },
      },
    });

    if (!tool) {
      redirect(
        buildAdminToolsListHref({
          statusFilter: currentStatusFilter,
          error: "not_found",
        }),
      );
    }

    const missingItems = collectPublishMissingItems({
      name: tool.name,
      websiteUrl: tool.websiteUrl,
      description: tool.description,
      categoryCount: tool.categories.length,
      primaryTrackingUrl: tool.affiliateLinks[0]?.trackingUrl || null,
    });

    if (missingItems.length > 0) {
      redirect(
        buildAdminToolDetailHref({
          slug: tool.slug,
          statusFilter: currentStatusFilter,
          publishErrorCodes: missingItems,
        }),
      );
    }

    await db.tool.update({
      where: { id: tool.id },
      data: { status: ToolStatus.ACTIVE },
    });

    revalidateSitePaths();
    revalidatePath(`/tools/${tool.slug}`);
    for (const category of tool.categories) {
      revalidatePath(`/use-cases/${category.category.slug}`);
    }

    redirect(
      buildAdminToolDetailHref({
        slug: tool.slug,
        statusFilter: currentStatusFilter,
        published: true,
      }),
    );
  } catch {
    redirect(
      buildAdminToolDetailHref({
        slug,
        statusFilter: currentStatusFilter,
        error: "publish_failed",
      }),
    );
  }
}
