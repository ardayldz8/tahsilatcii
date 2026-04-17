import { NextRequest, NextResponse } from "next/server";
import { unauthorized, internalError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";
import {
  buildReminderFallbackChannels,
  buildReminderMessage,
  DEFAULT_REMINDER_SETTINGS,
  determineAutomaticReminderType,
  normalizeReminderChannels,
} from "@/lib/reminders/helpers";
import { deliverReminder, mapProviderToChannel } from "@/lib/reminders/delivery";

type ReminderSettingsRow = {
  user_id: string;
  enabled: boolean;
  days_before: number;
  days_after: number;
  due_day: boolean;
  channels: unknown;
};

type InvoiceWithRelations = {
  id: string;
  user_id: string;
  invoice_no: string;
  amount: number;
  due_date: string;
  customers: { name: string; phone: string; email: string | null } | null;
};

type RetryableReminder = {
  id: string;
  user_id: string;
  invoice_id: string;
  invoice_no: string;
  channel: "whatsapp" | "sms" | "email";
  message: string;
  attempt_count: number;
  invoices:
    | {
        id: string;
        invoice_no: string;
        customers:
          | { name: string; phone: string; email: string | null }[]
          | { name: string; phone: string; email: string | null }
          | null;
      }[]
    | null;
};

function resolveReminderSettings(
  settings: ReminderSettingsRow | undefined
) {
  if (!settings) {
    return DEFAULT_REMINDER_SETTINGS;
  }

  return {
    enabled: settings.enabled,
    days_before: settings.days_before,
    days_after: settings.days_after,
    due_day: settings.due_day,
    channels: normalizeReminderChannels(settings.channels),
  };
}

function normalizeRetryReminderInvoice(reminder: RetryableReminder) {
  const invoice = Array.isArray(reminder.invoices)
    ? reminder.invoices[0] ?? null
    : reminder.invoices;
  const customer = Array.isArray(invoice?.customers)
    ? invoice?.customers[0] ?? null
    : invoice?.customers ?? null;

  return {
    invoice,
    customer,
  };
}

async function processRetryQueue(params: {
  supabase: Awaited<ReturnType<typeof createServiceClient>>;
  settingsMap: Map<string, ReminderSettingsRow>;
  now: Date;
}) {
  const { supabase, settingsMap } = params;
  const { data: retryQueue, error } = await supabase
    .from("reminders")
    .select(
      "id, user_id, invoice_id, invoice_no, channel, message, attempt_count, invoices(id, invoice_no, customers(name, phone, email))"
    )
    .eq("status", "failed")
    .lte("next_retry_at", params.now.toISOString())
    .order("next_retry_at", { ascending: true });

  if (error || !retryQueue) {
    return { retried: 0, retryFailures: 0 };
  }

  let retried = 0;
  let retryFailures = 0;

  for (const reminder of retryQueue as unknown as RetryableReminder[]) {
    const settings = resolveReminderSettings(settingsMap.get(reminder.user_id));
    const { customer: customerData } = normalizeRetryReminderInvoice(reminder);

    if (!settings.enabled || !customerData) {
      retryFailures += 1;
      await supabase
        .from("reminders")
        .update({
          next_retry_at: null,
          last_attempt_at: new Date().toISOString(),
          error_message: "Retry skipped because reminder settings are disabled or customer data is missing.",
        })
        .eq("id", reminder.id);
      continue;
    }

    const delivery = await deliverReminder({
      channel: reminder.channel,
      recipient: customerData,
      message: reminder.message,
      subject: `${reminder.invoice_no} odeme hatirlatmasi`,
      fallbackChannels: buildReminderFallbackChannels(reminder.channel, settings.channels),
      previousAttemptCount: reminder.attempt_count,
    });

    await supabase
      .from("reminders")
      .update({
        status: delivery.status,
        provider: mapProviderToChannel(delivery.provider),
        error_message: delivery.error ?? null,
        attempt_count: delivery.attemptCount,
        last_attempt_at: new Date().toISOString(),
        next_retry_at: delivery.nextRetryAt,
        sent_at: delivery.sentAt,
      })
      .eq("id", reminder.id);

    if (delivery.status === "sent") {
      retried += 1;
    } else {
      retryFailures += 1;
    }
  }

  return { retried, retryFailures };
}

async function processNewAutomaticReminders(params: {
  supabase: Awaited<ReturnType<typeof createServiceClient>>;
  settingsMap: Map<string, ReminderSettingsRow>;
  now: Date;
}) {
  const { supabase, settingsMap, now } = params;
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("*, customers(name, phone, email), profiles:user_id(full_name, plan)")
    .in("status", ["pending", "overdue"])
    .lte("due_date", threeDaysFromNow.toISOString().split("T")[0]);

  if (invoicesError) {
    throw new Error(invoicesError.message);
  }

  if (!invoices || invoices.length === 0) {
    return { processed: 0, created: 0, skipped: 0 };
  }

  let created = 0;
  let skipped = 0;
  const todayStr = now.toISOString().split("T")[0];

  for (const invoice of invoices as InvoiceWithRelations[]) {
    const settings = resolveReminderSettings(settingsMap.get(invoice.user_id));

    if (!settings.enabled || !invoice.customers) {
      skipped += 1;
      continue;
    }

    const reminderType = determineAutomaticReminderType(invoice.due_date, settings, now);

    if (!reminderType) {
      skipped += 1;
      continue;
    }

    const message = buildReminderMessage({
      customerName: invoice.customers.name,
      invoiceNo: invoice.invoice_no,
      amount: invoice.amount,
    });

    for (const channel of settings.channels) {
      const { data: existingReminder } = await supabase
        .from("reminders")
        .select("id")
        .eq("invoice_id", invoice.id)
        .eq("channel", channel)
        .gte("created_at", `${todayStr}T00:00:00`)
        .limit(1)
        .maybeSingle();

      if (existingReminder) {
        skipped += 1;
        continue;
      }

      const delivery = await deliverReminder({
        channel,
        recipient: invoice.customers,
        message,
        subject: `${invoice.invoice_no} odeme hatirlatmasi`,
      });

      await supabase.from("reminders").insert({
        invoice_id: invoice.id,
        user_id: invoice.user_id,
        customer_name: invoice.customers.name,
        invoice_no: invoice.invoice_no,
        channel,
        type: reminderType,
        status: delivery.status,
        message,
        provider: mapProviderToChannel(delivery.provider),
        error_message: delivery.error ?? null,
        attempt_count: delivery.attemptCount,
        last_attempt_at: new Date().toISOString(),
        next_retry_at: delivery.nextRetryAt,
        sent_at: delivery.sentAt,
      });

      created += 1;
    }
  }

  return { processed: invoices.length, created, skipped };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return unauthorized();
    }

    const supabase = await createServiceClient();
    const now = new Date();

    const { data: reminderSettings } = await supabase
      .from("reminder_settings")
      .select("user_id, enabled, days_before, days_after, due_day, channels");

    const settingsMap = new Map(
      (reminderSettings ?? []).map((settings) => [settings.user_id, settings as ReminderSettingsRow])
    );

    const retrySummary = await processRetryQueue({ supabase, settingsMap, now });
    const newReminderSummary = await processNewAutomaticReminders({
      supabase,
      settingsMap,
      now,
    });

    return NextResponse.json({
      message: "Cron job completed",
      processed: newReminderSummary.processed,
      created: newReminderSummary.created,
      skipped: newReminderSummary.skipped,
      retried: retrySummary.retried,
      retryFailures: retrySummary.retryFailures,
    });
  } catch (error) {
    if (error instanceof Error) {
      return internalError(error.message);
    }

    return internalError();
  }
}
