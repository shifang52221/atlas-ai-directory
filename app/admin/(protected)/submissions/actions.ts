"use server";

import { LinkKind, SubmissionStatus, ToolStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseAdminSubmissionConvertForm,
  parseAdminSubmissionStatusForm,
} from "@/lib/action-schemas";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { notifyOnSubmissionConvertedToTool } from "@/lib/email-notifications";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueToolSlug(baseRaw: string): Promise<string> {
  const db = getDb();
  const base = slugify(baseRaw) || `tool-${Date.now()}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await db.tool.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export async function updateSubmissionStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseAdminSubmissionStatusForm(formData);
  if (!parsed.success) {
    redirect("/admin/submissions?error=invalid_form");
  }

  const db = getDb();

  const submissionId = parsed.data.submissionId;
  const status = parsed.data.status;

  try {
    await db.submission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewedAt: new Date(),
      },
    });

    revalidatePath("/admin/submissions");
    redirect("/admin/submissions?updated=1");
  } catch {
    redirect("/admin/submissions?error=update_failed");
  }
}

export async function convertSubmissionToToolAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseAdminSubmissionConvertForm(formData);
  if (!parsed.success) {
    redirect("/admin/submissions?error=invalid_form");
  }

  const db = getDb();

  const submissionId = parsed.data.submissionId;

  try {
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        toolName: true,
        companyName: true,
        contactEmail: true,
        websiteUrl: true,
        message: true,
      },
    });

    if (!submission) {
      redirect("/admin/submissions?error=not_found");
    }

    const existingByUrl = await db.tool.findFirst({
      where: { websiteUrl: submission.websiteUrl },
      select: { slug: true },
    });

    if (existingByUrl) {
      await db.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.APPROVED,
          reviewedAt: new Date(),
        },
      });

      await notifyOnSubmissionConvertedToTool({
        toolName: submission.toolName,
        contactEmail: submission.contactEmail,
        toolSlug: existingByUrl.slug,
      });

      revalidatePath("/admin/submissions");
      redirect(`/admin/tools/${existingByUrl.slug}?saved=1`);
    }

    const slug = await generateUniqueToolSlug(submission.toolName);
    const descriptionLines = [
      submission.message?.trim() || "",
      `Submitted by ${submission.contactEmail}${submission.companyName ? ` (${submission.companyName})` : ""}.`,
    ].filter(Boolean);

    const createdTool = await db.tool.create({
      data: {
        slug,
        name: submission.toolName,
        tagline: submission.companyName
          ? `${submission.companyName} submission`
          : null,
        websiteUrl: submission.websiteUrl,
        description: descriptionLines.join(" "),
        status: ToolStatus.INACTIVE,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    const uncategorized = await db.category.upsert({
      where: { slug: "uncategorized" },
      update: { name: "Uncategorized" },
      create: {
        slug: "uncategorized",
        name: "Uncategorized",
      },
      select: { id: true },
    });

    await db.toolCategory.create({
      data: {
        toolId: createdTool.id,
        categoryId: uncategorized.id,
      },
    });

    await db.affiliateLink.create({
      data: {
        toolId: createdTool.id,
        linkKind: LinkKind.DIRECT,
        region: "global",
        destinationUrl: submission.websiteUrl,
        trackingUrl: submission.websiteUrl,
        isPrimary: true,
      },
    });

    await db.submission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    await notifyOnSubmissionConvertedToTool({
      toolName: submission.toolName,
      contactEmail: submission.contactEmail,
      toolSlug: createdTool.slug,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/tools");
    revalidatePath("/admin/submissions");
    revalidatePath("/tools");
    revalidatePath("/");

    redirect(`/admin/tools/${createdTool.slug}?saved=1`);
  } catch {
    redirect("/admin/submissions?error=convert_failed");
  }
}
