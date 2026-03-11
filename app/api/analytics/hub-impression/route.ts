import { EventType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  buildPrivacySafeAnalyticsContext,
  sanitizePlacementId,
} from "@/lib/analytics-context";
import { getDb } from "@/lib/db";
import { getEditorialHubPaths } from "@/lib/editorial-hubs";

const allowedHubPaths = new Set(getEditorialHubPaths());

function toSafeHubPath(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  if (!allowedHubPaths.has(trimmed)) {
    return null;
  }

  return trimmed;
}

function toSafeVariant(input: unknown): "A" | "B" {
  if (typeof input === "string" && input.trim().toUpperCase() === "B") {
    return "B";
  }
  return "A";
}

export async function POST(request: NextRequest) {
  let pagePath: string | null = null;
  let variant: "A" | "B" = "A";
  let placementId: string | undefined;

  try {
    const body = (await request.json()) as {
      pagePath?: unknown;
      variant?: unknown;
      placementId?: unknown;
    };
    pagePath = toSafeHubPath(body.pagePath);
    variant = toSafeVariant(body.variant);
    placementId = sanitizePlacementId(
      typeof body.placementId === "string" ? body.placementId : undefined,
    );
  } catch {
    pagePath = null;
    variant = "A";
    placementId = undefined;
  }

  if (!pagePath) {
    return NextResponse.json(
      { ok: false, error: "invalid_page_path" },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const analyticsContext = buildPrivacySafeAnalyticsContext({
      headers: request.headers,
    });
    await db.clickEvent.create({
      data: {
        eventType: EventType.OUTBOUND_CLICK,
        pagePath,
        sessionId: analyticsContext.sessionId,
        visitorHash: analyticsContext.visitorHash,
        countryCode: analyticsContext.countryCode,
        referrer: request.headers.get("referer") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        metadata: {
          schemaVersion: 1,
          kind: "HUB_IMPRESSION",
          pagePath,
          variant,
          placementId: placementId || "hub_hero",
          sessionHash: analyticsContext.visitorHash,
          countryCode: analyticsContext.countryCode,
        },
      },
    });
  } catch {
    // Non-blocking: keep 200 so client doesn't retry aggressively.
  }

  return NextResponse.json({ ok: true });
}
