import type { ReminderChannel, ReminderStatus } from "@/types/index";
import { buildWhatsappLink } from "@/lib/reminders/helpers";

export const REMINDER_DELIVERY_TIMEOUT_MS = 8_000;
export const REMINDER_DELIVERY_MAX_ATTEMPTS = 3;

const RETRY_BACKOFF_MINUTES = [5, 30, 180] as const;

export interface ReminderRecipient {
  name: string;
  phone: string;
  email: string | null;
}

export interface ReminderDeliveryAttempt {
  channel: ReminderChannel;
  provider: ReminderDeliveryResult["provider"];
  status: ReminderStatus;
  error?: string;
  retryable: boolean;
  attempt: number;
}

export interface ReminderDeliveryResult {
  status: ReminderStatus;
  sentAt: string | null;
  provider: "whatsapp-link" | "whatsapp-api" | "netgsm" | "resend" | "none";
  link?: string;
  error?: string;
  retryable: boolean;
  finalChannel: ReminderChannel;
  attemptCount: number;
  nextRetryAt: string | null;
  attempts: ReminderDeliveryAttempt[];
}

interface ProviderAttemptResult {
  status: ReminderStatus;
  sentAt: string | null;
  provider: ReminderDeliveryResult["provider"];
  link?: string;
  error?: string;
  retryable: boolean;
}

export function mapProviderToChannel(
  provider: ReminderDeliveryResult["provider"]
): "whatsapp" | "sms" | "email" | "none" {
  switch (provider) {
    case "whatsapp-link":
    case "whatsapp-api":
      return "whatsapp";
    case "netgsm":
      return "sms";
    case "resend":
      return "email";
    default:
      return "none";
  }
}

export function getReminderRetryAt(attemptCount: number, now = new Date()) {
  if (attemptCount >= REMINDER_DELIVERY_MAX_ATTEMPTS) {
    return null;
  }

  const delay = RETRY_BACKOFF_MINUTES[Math.min(attemptCount - 1, RETRY_BACKOFF_MINUTES.length - 1)];
  const retryAt = new Date(now);
  retryAt.setMinutes(retryAt.getMinutes() + delay);
  return retryAt.toISOString();
}

export async function deliverReminder(params: {
  channel: ReminderChannel;
  recipient: ReminderRecipient;
  message: string;
  subject?: string;
  fallbackChannels?: ReminderChannel[];
  previousAttemptCount?: number;
}) {
  const fallbackChannels = (params.fallbackChannels ?? []).filter(
    (channel) => channel !== params.channel
  );
  const deliveryChain = [params.channel, ...fallbackChannels];
  const attempts: ReminderDeliveryAttempt[] = [];
  let totalAttempts = params.previousAttemptCount ?? 0;
  let lastFailure: ProviderAttemptResult | null = null;

  for (const channel of deliveryChain) {
    const remainingAttempts = REMINDER_DELIVERY_MAX_ATTEMPTS - totalAttempts;
    if (remainingAttempts <= 0) {
      break;
    }

    const channelResult = await deliverThroughChannel({
      channel,
      recipient: params.recipient,
      message: params.message,
      subject: params.subject,
      maxAttempts: remainingAttempts,
      startingAttempt: totalAttempts,
    });

    attempts.push(...channelResult.attempts);
    totalAttempts += channelResult.attempts.length;

    if (channelResult.result.status === "sent") {
      return {
        ...channelResult.result,
        finalChannel: channel,
        attemptCount: totalAttempts,
        nextRetryAt: null,
        attempts,
        retryable: false,
      } satisfies ReminderDeliveryResult;
    }

    lastFailure = channelResult.result;

    if (totalAttempts >= REMINDER_DELIVERY_MAX_ATTEMPTS) {
      break;
    }
  }

  const retryable = attempts.some((attempt) => attempt.retryable);
  const nextRetryAt = retryable ? getReminderRetryAt(totalAttempts) : null;

  return {
    status: "failed",
    sentAt: null,
    provider: lastFailure?.provider ?? "none",
    link: lastFailure?.link,
    error:
      attempts
        .filter((attempt) => attempt.error)
        .map((attempt) => `${attempt.channel}: ${attempt.error}`)
        .join(" | ") || "Reminder delivery failed.",
    retryable,
    finalChannel: lastFailure ? attempts[attempts.length - 1]?.channel ?? params.channel : params.channel,
    attemptCount: totalAttempts,
    nextRetryAt,
    attempts,
  } satisfies ReminderDeliveryResult;
}

async function deliverThroughChannel(params: {
  channel: ReminderChannel;
  recipient: ReminderRecipient;
  message: string;
  subject?: string;
  maxAttempts: number;
  startingAttempt: number;
}) {
  const attempts: ReminderDeliveryAttempt[] = [];
  let lastResult: ProviderAttemptResult = {
    status: "failed",
    sentAt: null,
    provider: "none",
    error: "Reminder delivery failed.",
    retryable: false,
  };

  for (let index = 0; index < params.maxAttempts; index += 1) {
    const attemptNumber = params.startingAttempt + index + 1;
    const result = await deliverSingleAttempt(params.channel, {
      recipient: params.recipient,
      message: params.message,
      subject: params.subject,
    });

    attempts.push({
      channel: params.channel,
      provider: result.provider,
      status: result.status,
      error: result.error,
      retryable: result.retryable,
      attempt: attemptNumber,
    });

    lastResult = result;

    if (result.status === "sent" || !result.retryable) {
      break;
    }
  }

  return { attempts, result: lastResult };
}

async function deliverSingleAttempt(
  channel: ReminderChannel,
  params: {
    recipient: ReminderRecipient;
    message: string;
    subject?: string;
  }
): Promise<ProviderAttemptResult> {
  switch (channel) {
    case "whatsapp":
      return deliverWhatsapp(params.recipient, params.message);
    case "sms":
      return deliverSms(params.recipient, params.message);
    case "email":
      return deliverEmail(params.recipient, params.message, params.subject);
    default:
      return {
        status: "failed",
        sentAt: null,
        provider: "none",
        error: "Unsupported reminder channel.",
        retryable: false,
      };
  }
}

async function fetchWithTimeout(input: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMINDER_DELIVERY_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableStatus(status: number) {
  return status >= 500 || status === 408 || status === 429;
}

function createRequestFailureResult(
  provider: ProviderAttemptResult["provider"],
  status: number,
  message: string,
  link?: string
): ProviderAttemptResult {
  return {
    status: "failed",
    sentAt: null,
    provider,
    error: `${message} with ${status}`,
    retryable: isRetryableStatus(status),
    ...(link ? { link } : {}),
  };
}

function createExceptionFailureResult(
  provider: ProviderAttemptResult["provider"],
  fallbackMessage: string,
  error: unknown,
  link?: string
): ProviderAttemptResult {
  const isTimeout = error instanceof Error && error.name === "AbortError";

  return {
    status: "failed",
    sentAt: null,
    provider,
    error: isTimeout ? `${fallbackMessage} timed out.` : fallbackMessage,
    retryable: true,
    ...(link ? { link } : {}),
  };
}

async function deliverWhatsapp(
  recipient: ReminderRecipient,
  message: string
): Promise<ProviderAttemptResult> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const link = buildWhatsappLink(recipient.phone, message);

  if (!apiUrl || !apiKey) {
    return {
      status: "sent",
      sentAt: new Date().toISOString(),
      provider: "whatsapp-link",
      link,
      retryable: false,
    };
  }

  try {
    const response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: recipient.phone,
        message,
      }),
    });

    if (!response.ok) {
      return createRequestFailureResult(
        "whatsapp-api",
        response.status,
        "WhatsApp request failed",
        link
      );
    }

    return {
      status: "sent",
      sentAt: new Date().toISOString(),
      provider: "whatsapp-api",
      link,
      retryable: false,
    };
  } catch (error) {
    return createExceptionFailureResult(
      "whatsapp-api",
      "WhatsApp delivery failed.",
      error,
      link
    );
  }
}

async function deliverSms(
  recipient: ReminderRecipient,
  message: string
): Promise<ProviderAttemptResult> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_HEADER;

  if (!usercode || !password || !header) {
    return {
      status: "failed",
      sentAt: null,
      provider: "none",
      error: "SMS provider is not configured.",
      retryable: false,
    };
  }

  try {
    const payload = new URLSearchParams({
      usercode,
      password,
      gsmno: recipient.phone.replace(/\D/g, ""),
      message,
      msgheader: header,
      filter: "0",
    });

    const response = await fetchWithTimeout("https://api.netgsm.com.tr/sms/send/get/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    });

    if (!response.ok) {
      return createRequestFailureResult("netgsm", response.status, "SMS request failed");
    }

    return {
      status: "sent",
      sentAt: new Date().toISOString(),
      provider: "netgsm",
      retryable: false,
    };
  } catch (error) {
    return createExceptionFailureResult("netgsm", "SMS delivery failed.", error);
  }
}

async function deliverEmail(
  recipient: ReminderRecipient,
  message: string,
  subject?: string
): Promise<ProviderAttemptResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!recipient.email) {
    return {
      status: "failed",
      sentAt: null,
      provider: "none",
      error: "Recipient email is missing.",
      retryable: false,
    };
  }

  if (!apiKey || !from) {
    return {
      status: "failed",
      sentAt: null,
      provider: "none",
      error: "Email provider is not configured.",
      retryable: false,
    };
  }

  try {
    const response = await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient.email],
        subject: subject || "TahsilatCI odeme hatirlatmasi",
        text: message,
      }),
    });

    if (!response.ok) {
      return createRequestFailureResult("resend", response.status, "Email request failed");
    }

    return {
      status: "sent",
      sentAt: new Date().toISOString(),
      provider: "resend",
      retryable: false,
    };
  } catch (error) {
    return createExceptionFailureResult("resend", "Email delivery failed.", error);
  }
}
