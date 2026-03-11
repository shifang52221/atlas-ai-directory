function normalizeIp(value: string | null | undefined): string | null {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return null;
  }

  return normalized;
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = normalizeIp(headers.get("x-forwarded-for"));
  if (forwardedFor) {
    const first = forwardedFor
      .split(",")
      .map((item) => item.trim())
      .find(Boolean);

    if (first) {
      return first;
    }
  }

  const realIp = normalizeIp(headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
