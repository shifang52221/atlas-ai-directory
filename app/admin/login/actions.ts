"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseAdminLoginForm } from "@/lib/action-schemas";
import { loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { consumeRateLimit } from "@/lib/rate-limit";
import { auditRateLimitEvent } from "@/lib/rate-limit-audit";

function getAdminLoginRateLimitConfig(): { max: number; windowMs: number } {
  const max = Number.parseInt(
    process.env.ADMIN_LOGIN_RATE_LIMIT_MAX || "15",
    10,
  );
  const windowMinutes = Number.parseInt(
    process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MINUTES || "10",
    10,
  );

  return {
    max: Number.isNaN(max) ? 15 : Math.max(1, max),
    windowMs: (Number.isNaN(windowMinutes) ? 10 : Math.max(1, windowMinutes)) * 60_000,
  };
}

export async function loginAdminAction(formData: FormData) {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const rateLimit = consumeRateLimit({
    bucket: "admin_login",
    identifier: ip,
    ...getAdminLoginRateLimitConfig(),
  });
  await auditRateLimitEvent({
    bucket: "admin_login",
    ip,
    allowed: rateLimit.allowed,
    remaining: rateLimit.remaining,
    retryAfterMs: rateLimit.retryAfterMs,
  });
  if (!rateLimit.allowed) {
    redirect("/admin/login?error=rate_limited");
  }

  const parsed = parseAdminLoginForm(formData);
  if (!parsed.success) {
    redirect("/admin/login?error=1");
  }

  const ok = await loginAdmin(parsed.data.email, parsed.data.password);

  if (!ok) {
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await logoutAdmin();
  redirect("/admin/login");
}
