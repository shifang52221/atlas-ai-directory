import crypto from "crypto";

const countryHeaderKeys = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
];

function toSafeString(value: string | null | undefined): string {
  return (value || "").trim();
}

function normalizeCountryCode(value: string): string | undefined {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return undefined;
  }
  if (normalized === "XX" || normalized === "T1") {
    return undefined;
  }
  return normalized;
}

function getFirstForwardedIp(headers: Headers): string {
  const forwarded = toSafeString(headers.get("x-forwarded-for"));
  if (!forwarded) {
    return "";
  }
  return forwarded.split(",")[0]?.trim() || "";
}

function getAnalyticsSessionSalt(): string {
  const configured = toSafeString(process.env.ANALYTICS_SESSION_SALT);
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  return "atlas-dev-analytics-salt";
}

function toDayKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function sanitizePlacementId(value: string | null | undefined): string | undefined {
  const normalized = toSafeString(value);
  if (!normalized) {
    return undefined;
  }
  if (!/^[a-z0-9_-]{2,64}$/.test(normalized)) {
    return undefined;
  }
  return normalized;
}

export function extractCountryCodeFromHeaders(headers: Headers): string | undefined {
  for (const headerKey of countryHeaderKeys) {
    const raw = headers.get(headerKey);
    if (!raw) {
      continue;
    }
    const normalized = normalizeCountryCode(raw);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

export function buildPrivacySafeAnalyticsContext(input: {
  headers: Headers;
  now?: Date;
  sessionSalt?: string;
}): {
  sessionId?: string;
  visitorHash?: string;
  countryCode?: string;
} {
  const now = input.now || new Date();
  const sessionSalt = toSafeString(input.sessionSalt) || getAnalyticsSessionSalt();
  const countryCode = extractCountryCodeFromHeaders(input.headers);
  const forwardedIp = getFirstForwardedIp(input.headers);
  const userAgent = toSafeString(input.headers.get("user-agent"));
  const language = toSafeString(input.headers.get("accept-language"));

  if (!sessionSalt || (!forwardedIp && !userAgent && !language)) {
    return {
      countryCode,
    };
  }

  const payload = [
    sessionSalt,
    toDayKey(now),
    forwardedIp,
    userAgent,
    language,
  ].join("|");
  const visitorHash = crypto.createHash("sha256").update(payload).digest("hex");

  return {
    sessionId: visitorHash.slice(0, 24),
    visitorHash,
    countryCode,
  };
}
