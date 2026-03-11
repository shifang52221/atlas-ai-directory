import { describe, expect, it } from "vitest";
import { getClientIp } from "../../lib/request-ip";

describe("request ip", () => {
  it("reads first IP from x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18",
      "x-real-ip": "70.41.3.18",
    });

    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({
      "x-real-ip": "198.51.100.24",
    });

    expect(getClientIp(headers)).toBe("198.51.100.24");
  });

  it("returns unknown if no IP headers exist", () => {
    const headers = new Headers();

    expect(getClientIp(headers)).toBe("unknown");
  });
});
