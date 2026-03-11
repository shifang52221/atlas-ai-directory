import crypto from "crypto";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auditAdminAuthEvent } from "./admin-auth-audit";
import { getDb } from "./db";

const ADMIN_COOKIE = "atlas_admin_session";
const nonProdDefaultPassword = "atlas-admin";
const nonProdDefaultAdminEmail = "admin@atlas.local";
const sessionTtlSeconds = 60 * 60 * 24 * 14;

type LoginGuard = {
  windowStartMs: number;
  failedAttempts: number;
  blockedUntilMs: number;
};

type AdminIdentity = {
  email: string;
  role: UserRole;
};

type AdminSessionPayload = AdminIdentity & {
  iat: number;
  nonce: string;
};

type AdminAuthSecurityInput = {
  nodeEnv?: string;
  loginEmail?: string;
  password?: string;
  sessionSecret?: string;
};

declare global {
  var atlasAdminSessionSecret: string | undefined;
  var atlasAdminLoginGuards: Map<string, LoginGuard> | undefined;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isAllowedAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.EDITOR;
}

function getAdminPassword(): string {
  const configured = process.env.ADMIN_DASHBOARD_PASSWORD?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  return nonProdDefaultPassword;
}

function getAdminLoginEmail(): string {
  const configured = normalizeEmail(process.env.ADMIN_LOGIN_EMAIL || "");
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  return nonProdDefaultAdminEmail;
}

function getAdminSessionSecret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  if (!global.atlasAdminSessionSecret) {
    global.atlasAdminSessionSecret = crypto.randomBytes(32).toString("hex");
  }

  return global.atlasAdminSessionSecret;
}

function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    normalized.includes("replace-with") ||
    normalized.includes("changeme") ||
    normalized === "atlas-admin" ||
    normalized === "password" ||
    normalized === "admin"
  );
}

export function isAdminAuthConfigSecureForProduction(
  input?: AdminAuthSecurityInput,
): boolean {
  const nodeEnv = input?.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv !== "production") {
    return true;
  }

  const loginEmail = normalizeEmail(
    (input?.loginEmail ?? process.env.ADMIN_LOGIN_EMAIL) || "",
  );
  const password = (
    (input?.password ?? process.env.ADMIN_DASHBOARD_PASSWORD) || ""
  ).trim();
  const sessionSecret = (
    (input?.sessionSecret ?? process.env.ADMIN_SESSION_SECRET) || ""
  ).trim();

  if (!loginEmail || !loginEmail.includes("@")) {
    return false;
  }
  if (password.length < 20 || isPlaceholderValue(password)) {
    return false;
  }
  if (sessionSecret.length < 32 || isPlaceholderValue(sessionSecret)) {
    return false;
  }

  return true;
}

function signAdminSession(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function buildAdminSessionValue(identity: AdminIdentity, secret: string): string {
  const payload: AdminSessionPayload = {
    iat: Math.floor(Date.now() / 1000),
    nonce: crypto.randomBytes(16).toString("base64url"),
    email: identity.email,
    role: identity.role,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signAdminSession(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function readAdminSessionValue(
  value: string,
  secret: string,
): AdminSessionPayload | null {
  const parts = value.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = signAdminSession(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<AdminSessionPayload>;
    if (
      typeof parsed.iat !== "number" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (parsed.iat > now || now - parsed.iat > sessionTtlSeconds) {
      return null;
    }

    const email = normalizeEmail(parsed.email);
    if (!email || !isAllowedAdminRole(parsed.role as UserRole)) {
      return null;
    }

    return {
      iat: parsed.iat,
      nonce: parsed.nonce,
      email,
      role: parsed.role as UserRole,
    };
  } catch {
    return null;
  }
}

function getLoginGuardState(email: string): LoginGuard {
  if (!global.atlasAdminLoginGuards) {
    global.atlasAdminLoginGuards = new Map<string, LoginGuard>();
  }

  const key = normalizeEmail(email) || "unknown";
  const existing = global.atlasAdminLoginGuards.get(key);
  if (existing) {
    return existing;
  }

  const initialized: LoginGuard = {
    windowStartMs: Date.now(),
    failedAttempts: 0,
    blockedUntilMs: 0,
  };
  global.atlasAdminLoginGuards.set(key, initialized);

  return initialized;
}

function isLoginBlocked(email: string): boolean {
  const guard = getLoginGuardState(email);
  return guard.blockedUntilMs > Date.now();
}

function registerFailedLoginAttempt(email: string): void {
  const guard = getLoginGuardState(email);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;

  if (now - guard.windowStartMs > windowMs) {
    guard.windowStartMs = now;
    guard.failedAttempts = 0;
    guard.blockedUntilMs = 0;
  }

  guard.failedAttempts += 1;
  if (guard.failedAttempts >= 10) {
    guard.blockedUntilMs = now + 5 * 60 * 1000;
  }
}

function resetLoginGuard(email: string): void {
  const guard = getLoginGuardState(email);
  guard.failedAttempts = 0;
  guard.blockedUntilMs = 0;
  guard.windowStartMs = Date.now();
}

async function resolveAdminIdentity(email: string): Promise<AdminIdentity | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  try {
    const db = getDb();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        email: true,
        role: true,
      },
    });

    if (user && isAllowedAdminRole(user.role)) {
      return {
        email: normalizeEmail(user.email),
        role: user.role,
      };
    }

    if (!user && process.env.NODE_ENV !== "production") {
      const defaultEmail = getAdminLoginEmail();
      if (normalizedEmail === defaultEmail) {
        const created = await db.user.create({
          data: {
            email: defaultEmail,
            role: UserRole.ADMIN,
          },
          select: {
            email: true,
            role: true,
          },
        });

        return {
          email: normalizeEmail(created.email),
          role: created.role,
        };
      }
    }

    return null;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      const defaultEmail = getAdminLoginEmail();
      if (normalizedEmail === defaultEmail) {
        return {
          email: defaultEmail,
          role: UserRole.ADMIN,
        };
      }
    }

    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  const secret = getAdminSessionSecret();

  if (!session || !secret) {
    return false;
  }

  const parsed = readAdminSessionValue(session, secret);
  return Boolean(parsed);
}

export async function requireAdmin(): Promise<void> {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    await auditAdminAuthEvent({
      event: "login",
      success: false,
      email: "unknown",
      reason: "missing_email",
    });
    return false;
  }

  if (!isAdminAuthConfigSecureForProduction()) {
    await auditAdminAuthEvent({
      event: "login",
      success: false,
      email: normalizedEmail,
      reason: "insecure_production_config",
    });
    return false;
  }

  if (isLoginBlocked(normalizedEmail)) {
    await auditAdminAuthEvent({
      event: "login",
      success: false,
      email: normalizedEmail,
      reason: "rate_limited",
    });
    return false;
  }

  const normalizedPassword = password.trim();
  const expectedPassword = getAdminPassword();
  const secret = getAdminSessionSecret();
  const validPassword =
    normalizedPassword.length > 0 &&
    expectedPassword.length > 0 &&
    secret.length > 0 &&
    normalizedPassword === expectedPassword;
  if (!validPassword) {
    registerFailedLoginAttempt(normalizedEmail);
    await auditAdminAuthEvent({
      event: "login",
      success: false,
      email: normalizedEmail,
      reason: "invalid_password",
    });
    return false;
  }

  const identity = await resolveAdminIdentity(normalizedEmail);
  if (!identity) {
    registerFailedLoginAttempt(normalizedEmail);
    await auditAdminAuthEvent({
      event: "login",
      success: false,
      email: normalizedEmail,
      reason: "unauthorized_role_or_user",
    });
    return false;
  }

  resetLoginGuard(normalizedEmail);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, buildAdminSessionValue(identity, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionTtlSeconds,
  });

  await auditAdminAuthEvent({
    event: "login",
    success: true,
    email: identity.email,
    role: identity.role,
  });

  return true;
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const secret = getAdminSessionSecret();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  const payload = session && secret ? readAdminSessionValue(session, secret) : null;

  cookieStore.delete(ADMIN_COOKIE);

  await auditAdminAuthEvent({
    event: "logout",
    success: true,
    email: payload?.email || "unknown",
    role: payload?.role,
  });
}
