"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseAdminCategoryDeleteForm,
  parseAdminCategoryForm,
} from "@/lib/action-schemas";
import { requireAdmin } from "@/lib/admin-auth";
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

function revalidateCategoryPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/use-cases");
  revalidatePath("/");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseAdminCategoryForm(formData);
  if (!parsed.success) {
    redirect("/admin/categories?error=invalid_form");
  }

  const db = getDb();

  const name = parsed.data.name;
  const inputSlug = parsed.data.slug || "";
  const slug = slugify(inputSlug || name);
  const description = parsed.data.description || "";

  if (!name || !slug) {
    redirect("/admin/categories?error=missing_required");
  }

  try {
    await db.category.upsert({
      where: { slug },
      update: {
        name,
        description: description || null,
      },
      create: {
        slug,
        name,
        description: description || null,
      },
    });

    revalidateCategoryPaths();
    revalidatePath(`/use-cases/${slug}`);
    redirect("/admin/categories?saved=1");
  } catch {
    redirect("/admin/categories?error=save_failed");
  }
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseAdminCategoryDeleteForm(formData);
  if (!parsed.success) {
    redirect("/admin/categories?error=invalid_form");
  }

  const db = getDb();

  const slug = parsed.data.slug;

  try {
    await db.category.delete({
      where: { slug },
    });

    revalidateCategoryPaths();
    revalidatePath(`/use-cases/${slug}`);
    redirect("/admin/categories?deleted=1");
  } catch {
    redirect("/admin/categories?error=delete_failed");
  }
}
