import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAppUrl,
  sendEmailNotification,
} from "../../lib/email-notifications";

describe("email notifications", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
    vi.restoreAllMocks();
  });

  it("builds absolute URL using APP_BASE_URL", () => {
    process.env.APP_BASE_URL = "https://atlas.example.com";
    expect(buildAppUrl("/admin/submissions")).toBe(
      "https://atlas.example.com/admin/submissions",
    );
  });

  it("skips sending when config is missing", async () => {
    process.env.RESEND_API_KEY = "";
    process.env.NOTIFY_FROM_EMAIL = "";

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const ok = await sendEmailNotification({
      to: "ops@example.com",
      subject: "test",
      html: "<p>test</p>",
    });

    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
