import { describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimitStore } from "../../lib/rate-limit";

describe("rate limit", () => {
  it("allows requests within the configured window quota", () => {
    resetRateLimitStore();
    const first = consumeRateLimit({
      bucket: "submit",
      identifier: "127.0.0.1",
      max: 2,
      windowMs: 60_000,
      nowMs: 1_000,
    });
    const second = consumeRateLimit({
      bucket: "submit",
      identifier: "127.0.0.1",
      max: 2,
      windowMs: 60_000,
      nowMs: 2_000,
    });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("blocks requests after exceeding quota in the same window", () => {
    resetRateLimitStore();
    consumeRateLimit({
      bucket: "submit",
      identifier: "127.0.0.1",
      max: 1,
      windowMs: 60_000,
      nowMs: 1_000,
    });
    const blocked = consumeRateLimit({
      bucket: "submit",
      identifier: "127.0.0.1",
      max: 1,
      windowMs: 60_000,
      nowMs: 2_000,
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets quota when the window has passed", () => {
    resetRateLimitStore();
    consumeRateLimit({
      bucket: "admin_login",
      identifier: "10.0.0.1",
      max: 1,
      windowMs: 60_000,
      nowMs: 1_000,
    });

    const afterWindow = consumeRateLimit({
      bucket: "admin_login",
      identifier: "10.0.0.1",
      max: 1,
      windowMs: 60_000,
      nowMs: 62_000,
    });

    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(0);
  });
});
