"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseSubmissionForm } from "@/lib/action-schemas";
import { getDb } from "@/lib/db";
import { notifyOnSubmissionReceived } from "@/lib/email-notifications";
import { getClientIp } from "@/lib/request-ip";
import { consumeRateLimit } from "@/lib/rate-limit";
import { auditRateLimitEvent } from "@/lib/rate-limit-audit";

function getSubmitRateLimitConfig(): { max: number; windowMs: number } {
  const max = Number.parseInt(process.env.SUBMIT_RATE_LIMIT_MAX || "12", 10);
  const windowMinutes = Number.parseInt(
    process.env.SUBMIT_RATE_LIMIT_WINDOW_MINUTES || "10",
    10,
  );

  return {
    max: Number.isNaN(max) ? 12 : Math.max(1, max),
    windowMs: (Number.isNaN(windowMinutes) ? 10 : Math.max(1, windowMinutes)) * 60_000,
  };
}

export async function createSubmissionAction(formData: FormData) {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const rateLimit = consumeRateLimit({
    bucket: "submit_form",
    identifier: ip,
    ...getSubmitRateLimitConfig(),
  });
  await auditRateLimitEvent({
    bucket: "submit_form",
    ip,
    allowed: rateLimit.allowed,
    remaining: rateLimit.remaining,
    retryAfterMs: rateLimit.retryAfterMs,
  });
  if (!rateLimit.allowed) {
    redirect("/submit?error=rate_limited");
  }

  const contactEmailRaw = String(formData.get("contactEmail") || "");
  const toolNameRaw = String(formData.get("toolName") || "");
  const websiteUrlRaw = String(formData.get("websiteUrl") || "");

  const parsed = parseSubmissionForm(formData);
  if (!parsed.success) {
    if (
      !contactEmailRaw.trim() ||
      !toolNameRaw.trim() ||
      !websiteUrlRaw.trim()
    ) {
      redirect("/submit?error=missing_required");
    }
    redirect("/submit?error=invalid_url");
  }

  const { contactEmail, toolName, websiteUrl, companyName, message } = parsed.data;

  try {
    const db = getDb();
    await db.submission.create({
      data: {
        contactEmail,
        toolName,
        websiteUrl,
        companyName: companyName || null,
        message: message || null,
      },
    });

    await notifyOnSubmissionReceived({
      toolName,
      companyName: companyName || "",
      contactEmail,
      websiteUrl,
      message: message || "",
    });

    redirect("/submit?success=1");
  } catch {
    redirect("/submit?error=save_failed");
  }
}
