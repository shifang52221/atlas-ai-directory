import { NextRequest, NextResponse } from "next/server";

const HUB_VARIANT_COOKIE = "atlas_hub_variant";

function normalizeVariant(input: string | null | undefined): "A" | "B" | null {
  const normalized = (input || "").trim().toUpperCase();
  if (normalized === "A" || normalized === "B") {
    return normalized;
  }
  return null;
}

function pickRandomVariant(): "A" | "B" {
  return Math.random() < 0.5 ? "A" : "B";
}

function setVariantCookie(response: NextResponse, variant: "A" | "B") {
  response.cookies.set({
    name: HUB_VARIANT_COOKIE,
    value: variant,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function proxy(request: NextRequest) {
  const queryVariant =
    normalizeVariant(request.nextUrl.searchParams.get("variant")) ||
    normalizeVariant(request.nextUrl.searchParams.get("v"));
  const cookieVariant = normalizeVariant(
    request.cookies.get(HUB_VARIANT_COOKIE)?.value,
  );
  const resolvedVariant = queryVariant || cookieVariant || pickRandomVariant();

  const shouldPersistCookie = cookieVariant !== resolvedVariant;

  if (!queryVariant) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.searchParams.delete("v");
    rewriteUrl.searchParams.set("variant", resolvedVariant);

    const response = NextResponse.rewrite(rewriteUrl);
    if (shouldPersistCookie) {
      setVariantCookie(response, resolvedVariant);
    }
    return response;
  }

  const response = NextResponse.next();
  if (shouldPersistCookie) {
    setVariantCookie(response, resolvedVariant);
  }
  return response;
}

export const config = {
  matcher: [
    "/best-ai-automation-tools",
    "/best-ai-agents-for-sales",
    "/best-ai-tools-for-support",
    "/best-ai-tools-for-marketing",
    "/best-ai-automation-tools-for-small-business",
    "/best-ai-sales-agents-for-smb",
    "/best-ai-tools-for-marketing-under-100",
    "/best-ai-tools-for-support-ticket-triage",
    "/make-alternatives",
    "/semrush-alternatives",
    "/hubspot-alternatives-for-startups",
    "/monday-vs-clickup-for-ops",
    "/synthesia-alternatives",
    "/descript-alternatives",
    "/ai-sales-automation-tools-for-lead-enrichment",
    "/ai-workflow-tools-for-internal-operations",
  ],
};
