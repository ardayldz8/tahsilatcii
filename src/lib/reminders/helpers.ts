import type { ReminderChannel, ReminderSettings, ReminderType } from "@/types/index";

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  days_before: 3,
  days_after: 1,
  due_day: true,
  channels: ["whatsapp"],
};

export function normalizeReminderChannels(value: unknown): ReminderChannel[] {
  if (!Array.isArray(value)) {
    return DEFAULT_REMINDER_SETTINGS.channels;
  }

  const validChannels: ReminderChannel[] = ["whatsapp", "sms", "email"];
  const channels = value.filter(
    (item): item is ReminderChannel =>
      typeof item === "string" && validChannels.includes(item as ReminderChannel)
  );

  return channels.length > 0 ? channels : DEFAULT_REMINDER_SETTINGS.channels;
}

export function determineAutomaticReminderType(
  dueDate: string,
  settings: ReminderSettings,
  now = new Date()
): ReminderType | null {
  const todayStr = now.toISOString().split("T")[0];
  const msPerDay = 1000 * 60 * 60 * 24;
  const dayDiff = Math.floor(
    (new Date(todayStr).getTime() - new Date(dueDate).getTime()) / msPerDay
  );

  if (dayDiff < 0 && Math.abs(dayDiff) === settings.days_before) {
    return "vade-oncesi";
  }

  if (dayDiff === 0 && settings.due_day) {
    return "vade-gunu";
  }

  if (dayDiff > 0 && dayDiff === settings.days_after) {
    return "vade-sonrasi";
  }

  return null;
}

export function buildReminderMessage(params: {
  customerName: string;
  invoiceNo: string;
  amount: number;
  senderName?: string | null;
  customMessage?: string | null;
}) {
  const { customerName, invoiceNo, amount, senderName, customMessage } = params;

  if (customMessage) {
    return customMessage;
  }

  const suffix = senderName ? ` Iyi gunler dileriz. - ${senderName}` : "";
  return `Sayin ${customerName}, ${invoiceNo} numarali ${amount} TL tutarindaki faturanizi hatirlatmak isteriz.${suffix}`;
}

export function buildWhatsappLink(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "").replace(/^0+/, "");
  const phoneWithCountry = normalizedPhone.startsWith("90")
    ? normalizedPhone
    : `90${normalizedPhone}`;

  return `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
}

export function buildReminderFallbackChannels(
  preferredChannel: ReminderChannel,
  availableChannels: ReminderChannel[]
) {
  return availableChannels.filter((channel) => channel !== preferredChannel);
}
