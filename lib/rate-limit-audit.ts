import fs from "fs/promises";
import path from "path";

type RateLimitAuditInput = {
  bucket: string;
  ip: string;
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

function getAuditPath(): string {
  return path.join(process.cwd(), "dev.log");
}

export async function auditRateLimitEvent(
  input: RateLimitAuditInput,
): Promise<void> {
  const entry = {
    timestamp: new Date().toISOString(),
    scope: "rate_limit",
    ...input,
  };

  try {
    await fs.appendFile(getAuditPath(), `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Intentionally non-blocking.
  }
}
