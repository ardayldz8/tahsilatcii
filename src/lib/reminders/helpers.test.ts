import { describe, expect, it } from "vitest";
import {
  buildReminderMessage,
  buildWhatsappLink,
  DEFAULT_REMINDER_SETTINGS,
  determineAutomaticReminderType,
  normalizeReminderChannels,
} from "@/lib/reminders/helpers";

describe("reminder helpers", () => {
  it("normalizes invalid channels to defaults", () => {
    expect(normalizeReminderChannels(["sms", "invalid"])) .toEqual(["sms"]);
    expect(normalizeReminderChannels("bad")).toEqual(["whatsapp"]);
  });

  it("determines reminder types based on due date and settings", () => {
    const now = new Date("2026-04-14T12:00:00Z");

    expect(
      determineAutomaticReminderType("2026-04-17", DEFAULT_REMINDER_SETTINGS, now)
    ).toBe("vade-oncesi");
    expect(
      determineAutomaticReminderType("2026-04-14", DEFAULT_REMINDER_SETTINGS, now)
    ).toBe("vade-gunu");
    expect(
      determineAutomaticReminderType("2026-04-13", DEFAULT_REMINDER_SETTINGS, now)
    ).toBe("vade-sonrasi");
  });

  it("builds reminder messages with sender name or custom override", () => {
    expect(
      buildReminderMessage({
        customerName: "Ahmet",
        invoiceNo: "FAT-001",
        amount: 2500,
        senderName: "Arda",
      })
    ).toContain("- Arda");

    expect(
      buildReminderMessage({
        customerName: "Ahmet",
        invoiceNo: "FAT-001",
        amount: 2500,
        customMessage: "Ozel mesaj",
      })
    ).toBe("Ozel mesaj");
  });

  it("builds whatsapp links with Turkish country code", () => {
    const link = buildWhatsappLink("0532 123 45 67", "Merhaba");
    expect(link).toContain("wa.me/905321234567");
    expect(link).toContain("text=Merhaba");
  });
});
