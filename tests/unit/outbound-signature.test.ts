import { LinkKind } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildOutboundSignature,
  isValidOutboundSignature,
} from "../../lib/outbound-signature";

describe("outbound signature", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
    process.env.OUTBOUND_SIGNING_SECRET = "test-signing-secret";
  });

  it("validates signatures built from outbound parameters", () => {
    const input = {
      toolSlug: "zapier-ai",
      target: "https://zapier.com/?ref=atlas",
      linkKind: LinkKind.DIRECT,
      sourcePath: "/tools/zapier-ai",
      affiliateLinkId: "",
      placementId: "tool_profile_primary",
    };

    const signature = buildOutboundSignature(input);
    const valid = isValidOutboundSignature(input, signature);
    expect(valid).toBe(true);
  });

  it("rejects signatures if target is tampered", () => {
    const input = {
      toolSlug: "zapier-ai",
      target: "https://zapier.com/?ref=atlas",
      linkKind: LinkKind.DIRECT,
      sourcePath: "/tools/zapier-ai",
      affiliateLinkId: "",
      placementId: "tool_profile_primary",
    };

    const signature = buildOutboundSignature(input);
    const valid = isValidOutboundSignature(
      {
        ...input,
        target: "https://example.com/phishing",
      },
      signature,
    );
    expect(valid).toBe(false);
  });

  it("rejects signatures if placement id is tampered", () => {
    const input = {
      toolSlug: "zapier-ai",
      target: "https://zapier.com/?ref=atlas",
      linkKind: LinkKind.DIRECT,
      sourcePath: "/tools/zapier-ai",
      affiliateLinkId: "",
      placementId: "tool_profile_primary",
    };

    const signature = buildOutboundSignature(input);
    const valid = isValidOutboundSignature(
      {
        ...input,
        placementId: "editorial_hub_recommendation",
      },
      signature,
    );
    expect(valid).toBe(false);
  });
});
