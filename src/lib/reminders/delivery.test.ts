import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deliverReminder,
  getReminderRetryAt,
} from "@/lib/reminders/delivery";

describe("reminder delivery", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to WhatsApp link delivery when API is not configured", async () => {
    const result = await deliverReminder({
      channel: "whatsapp",
      recipient: { name: "Ahmet", phone: "0532 123 45 67", email: null },
      message: "Merhaba",
    });

    expect(result.status).toBe("sent");
    expect(result.provider).toBe("whatsapp-link");
    expect(result.link).toContain("wa.me/905321234567");
  });

  it("fails SMS delivery when Netgsm config is missing", async () => {
    const result = await deliverReminder({
      channel: "sms",
      recipient: { name: "Ahmet", phone: "0532 123 45 67", email: null },
      message: "Merhaba",
    });

    expect(result.status).toBe("failed");
    expect(result.error).toContain("SMS provider");
  });

  it("sends email through Resend when configured", async () => {
    process.env.RESEND_API_KEY = "resend-key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverReminder({
      channel: "email",
      recipient: { name: "Ahmet", phone: "0532 123 45 67", email: "ahmet@example.com" },
      message: "Merhaba",
      subject: "Test",
    });

    expect(result.status).toBe("sent");
    expect(result.provider).toBe("resend");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("retries retryable provider failures before succeeding", async () => {
    process.env.RESEND_API_KEY = "resend-key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverReminder({
      channel: "email",
      recipient: { name: "Ahmet", phone: "0532 123 45 67", email: "ahmet@example.com" },
      message: "Merhaba",
      subject: "Test",
    });

    expect(result.status).toBe("sent");
    expect(result.attemptCount).toBe(2);
    expect(result.attempts).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to email when sms delivery cannot be completed", async () => {
    process.env.RESEND_API_KEY = "resend-key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverReminder({
      channel: "sms",
      recipient: { name: "Ahmet", phone: "0532 123 45 67", email: "ahmet@example.com" },
      message: "Merhaba",
      subject: "Test",
      fallbackChannels: ["email"],
    });

    expect(result.status).toBe("sent");
    expect(result.finalChannel).toBe("email");
    expect(result.attempts.at(-1)?.channel).toBe("email");
  });

  it("schedules retry metadata when all retryable attempts fail", async () => {
    process.env.RESEND_API_KEY = "resend-key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverReminder({
      channel: "email",
      recipient: { name: "Ahmet", phone: "0532 123 45 67", email: "ahmet@example.com" },
      message: "Merhaba",
      subject: "Test",
    });

    expect(result.status).toBe("failed");
    expect(result.retryable).toBe(true);
    expect(result.attemptCount).toBe(3);
    expect(result.nextRetryAt).toBeNull();
  });

  it("computes next retry time for non-terminal attempts", () => {
    const now = new Date("2026-04-15T10:00:00.000Z");
    expect(getReminderRetryAt(1, now)).toBe("2026-04-15T10:05:00.000Z");
  });
});
