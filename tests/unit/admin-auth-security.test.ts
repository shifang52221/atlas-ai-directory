import { describe, expect, it } from "vitest";
import { isAdminAuthConfigSecureForProduction } from "../../lib/admin-auth";

describe("admin auth production security config", () => {
  it("rejects weak or placeholder production secrets", () => {
    expect(
      isAdminAuthConfigSecureForProduction({
        nodeEnv: "production",
        loginEmail: "admin@atlas.local",
        password: "atlas-admin",
        sessionSecret: "replace-with-a-long-random-secret",
      }),
    ).toBe(false);
  });

  it("accepts strong production auth config", () => {
    expect(
      isAdminAuthConfigSecureForProduction({
        nodeEnv: "production",
        loginEmail: "admin@example.com",
        password: "A_strong_random_password_2026!",
        sessionSecret:
          "6e8fce2f6e794a498db7f19f2d8af9d71b34b74d9f5c5f403b90f3f95c91c0aa",
      }),
    ).toBe(true);
  });
});
