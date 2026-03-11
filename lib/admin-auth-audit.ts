import { UserRole } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

type AdminAuthAuditInput = {
  event: "login" | "logout";
  success: boolean;
  email: string;
  role?: UserRole;
  reason?: string;
};

function getAuditPath(): string {
  return path.join(process.cwd(), "dev.log");
}

export async function auditAdminAuthEvent(
  input: AdminAuthAuditInput,
): Promise<void> {
  const entry = {
    timestamp: new Date().toISOString(),
    scope: "admin_auth",
    ...input,
  };

  try {
    await fs.appendFile(getAuditPath(), `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Intentionally non-blocking.
  }
}
