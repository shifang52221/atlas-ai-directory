"use client";

import { useEffect } from "react";

type HubImpressionTrackerProps = {
  pagePath: string;
  variant?: "A" | "B";
};

export function HubImpressionTracker({
  pagePath,
  variant = "A",
}: HubImpressionTrackerProps) {
  useEffect(() => {
    const key = `atlas_hub_impression:${pagePath}:${variant}`;
    try {
      if (window.sessionStorage.getItem(key)) {
        return;
      }
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Session storage may be unavailable in privacy modes. Continue best-effort.
    }

    void fetch("/api/analytics/hub-impression", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ pagePath, variant }),
      keepalive: true,
      cache: "no-store",
    }).catch(() => {
      // Non-blocking analytics write.
    });
  }, [pagePath, variant]);

  return (
    <span
      data-ui="hub-impression-tracker"
      data-page-path={pagePath}
      data-variant={variant}
      hidden
    />
  );
}
