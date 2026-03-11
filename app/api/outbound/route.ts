import { EventType, LinkKind } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isValidOutboundSignature } from "@/lib/outbound-signature";

function toLinkKind(value: string | null): LinkKind {
  if (value === LinkKind.AFFILIATE) {
    return LinkKind.AFFILIATE;
  }
  if (value === LinkKind.SPONSORED) {
    return LinkKind.SPONSORED;
  }

  return LinkKind.DIRECT;
}

function toEventType(linkKind: LinkKind): EventType {
  if (linkKind === LinkKind.AFFILIATE || linkKind === LinkKind.SPONSORED) {
    return EventType.AFFILIATE_CLICK;
  }

  return EventType.OUTBOUND_CLICK;
}

function getSafeRedirectTarget(value: string | null): URL | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function toSafeVariant(value: string | null): "A" | "B" | undefined {
  if (!value) {
    return undefined;
  }
  if (value.trim().toUpperCase() === "B") {
    return "B";
  }
  if (value.trim().toUpperCase() === "A") {
    return "A";
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const toolSlug = request.nextUrl.searchParams.get("toolSlug") || "";
  const linkKind = toLinkKind(request.nextUrl.searchParams.get("linkKind"));
  const sourcePath =
    request.nextUrl.searchParams.get("sourcePath") || "/tools";
  const targetParam = request.nextUrl.searchParams.get("target") || "";
  const signature = request.nextUrl.searchParams.get("sig");
  const affiliateLinkId =
    request.nextUrl.searchParams.get("affiliateLinkId") || undefined;
  const variant = toSafeVariant(request.nextUrl.searchParams.get("variant"));

  if (
    !isValidOutboundSignature(
      {
        toolSlug,
        target: targetParam,
        linkKind,
        sourcePath,
        affiliateLinkId,
      },
      signature,
    )
  ) {
    return NextResponse.redirect(new URL("/tools", request.url), 302);
  }

  const target = getSafeRedirectTarget(
    targetParam,
  );

  if (!target) {
    return NextResponse.redirect(new URL("/tools", request.url), 302);
  }

  try {
    const db = getDb();
    const tool = toolSlug
      ? await db.tool.findUnique({
          where: { slug: toolSlug },
          select: { id: true },
        })
      : null;

    await db.clickEvent.create({
      data: {
        eventType: toEventType(linkKind),
        pagePath: sourcePath,
        toolId: tool?.id,
        affiliateLinkId,
        referrer: request.headers.get("referer") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        metadata: {
          targetUrl: target.toString(),
          toolSlug,
          linkKind,
          variant,
        },
      },
    });
  } catch {
    // Continue redirecting even if tracking write fails.
  }

  return NextResponse.redirect(target, 307);
}
