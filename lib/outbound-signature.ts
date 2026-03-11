import crypto from "crypto";
import { LinkKind } from "@prisma/client";

type OutboundSignatureInput = {
  toolSlug: string;
  target: string;
  linkKind: LinkKind;
  sourcePath: string;
  affiliateLinkId?: string;
};

declare global {
  var atlasOutboundSigningSecret: string | undefined;
}

function getSigningSecret(): string {
  const fromEnv = process.env.OUTBOUND_SIGNING_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  if (!global.atlasOutboundSigningSecret) {
    global.atlasOutboundSigningSecret = crypto.randomBytes(32).toString("hex");
  }

  return global.atlasOutboundSigningSecret;
}

function toSignaturePayload(input: OutboundSignatureInput): string {
  return [
    input.toolSlug.trim(),
    input.target.trim(),
    input.linkKind,
    input.sourcePath.trim(),
    input.affiliateLinkId?.trim() || "",
  ].join("|");
}

function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export function buildOutboundSignature(input: OutboundSignatureInput): string {
  const secret = getSigningSecret();
  if (!secret) {
    return "";
  }

  return signPayload(toSignaturePayload(input), secret);
}

export function isValidOutboundSignature(
  input: OutboundSignatureInput,
  signature: string | null,
): boolean {
  if (!signature) {
    return false;
  }

  const secret = getSigningSecret();
  if (!secret) {
    return false;
  }

  const expected = signPayload(toSignaturePayload(input), secret);

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
