import { NextRequest, NextResponse } from "next/server";
import { forbidden, internalError, notFound } from "@/lib/api/errors";
import { parseJsonBody, parseRouteParams } from "@/lib/api/validation";
import { safeRevalidateTags } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/types/index";
import {
  buildReminderFallbackChannels,
  buildReminderMessage,
} from "@/lib/reminders/helpers";
import { deliverReminder, mapProviderToChannel } from "@/lib/reminders/delivery";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import { uuidParamsSchema } from "@/lib/validation/common";
import { sendReminderSchema } from "@/lib/validation/reminders";

type RouteContext = { params: Promise<{ id: string }> };

function isMissingReminderReliabilityColumnsError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("attempt_count") ||
    normalized.includes("last_attempt_at") ||
    normalized.includes("next_retry_at")
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const paramsResult = await parseRouteParams(context.params, uuidParamsSchema);
    if (!paramsResult.success) return paramsResult.response;

    const { id } = paramsResult.data;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, customers(name, phone, email)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (invoiceError) return internalError(invoiceError.message);

    if (!invoice) return notFound("Invoice not found");

    const bodyResult = await parseJsonBody(request, sendReminderSchema);
    if (!bodyResult.success) return bodyResult.response;

    const { channel, message } = bodyResult.data;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, full_name")
      .eq("id", userId)
      .single();

    if (profileError) return internalError(profileError.message);

    if (!profile) return notFound("Profile not found");

    const limits = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];
    const allowedChannels = limits.channels;

    if (!allowedChannels.includes(channel))
      return forbidden(
        "This channel is not available on your plan",
        { channel, allowedChannels }
      );

    if (limits.maxReminders !== Infinity) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: reminderCount } = await supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      if ((reminderCount ?? 0) >= limits.maxReminders)
        return forbidden(
          "Monthly reminder limit reached. Upgrade your plan.",
          { maxReminders: limits.maxReminders }
        );
    }

    const customerData = (Array.isArray(invoice.customers)
      ? invoice.customers[0]
      : invoice.customers) as {
      name: string;
      phone: string;
      email: string | null;
    };

    if (!customerData?.name || !customerData?.phone) {
      return notFound("Musteri bilgileri eksik oldugu icin hatirlatma gonderilemedi.");
    }

    const defaultMessage = buildReminderMessage({
      customerName: customerData.name,
      invoiceNo: invoice.invoice_no,
      amount: invoice.amount,
      senderName: profile.full_name,
      customMessage: message,
    });

    const delivery = await deliverReminder({
      channel,
      recipient: customerData,
      message: defaultMessage,
      subject: `${invoice.invoice_no} odeme hatirlatmasi`,
      fallbackChannels: buildReminderFallbackChannels(channel, allowedChannels),
    });

    const reminderPayload = {
      invoice_id: id,
      user_id: userId,
      customer_name: customerData.name,
      invoice_no: invoice.invoice_no,
      channel,
      type: "manuel" as const,
      status: delivery.status,
      message: defaultMessage,
      provider: mapProviderToChannel(delivery.provider),
      error_message: delivery.error ?? null,
      attempt_count: delivery.attemptCount,
      last_attempt_at: new Date().toISOString(),
      next_retry_at: delivery.nextRetryAt,
      sent_at: delivery.sentAt,
    };

    let insertResult = await supabase
      .from("reminders")
      .insert(reminderPayload)
      .select()
      .single();

    if (insertResult.error && isMissingReminderReliabilityColumnsError(insertResult.error.message)) {
      const legacyPayload = Object.fromEntries(
        Object.entries(reminderPayload).filter(
          ([key]) =>
            key !== "attempt_count" &&
            key !== "last_attempt_at" &&
            key !== "next_retry_at"
        )
      );

      insertResult = await supabase
        .from("reminders")
        .insert(legacyPayload)
        .select()
        .single();
    }

    if (insertResult.error) return internalError(insertResult.error.message);
    const reminder = insertResult.data;

    safeRevalidateTags([`dashboard:${userId}`]);

    return NextResponse.json(
      {
        reminder,
        delivery,
        ...(delivery.link && {
          whatsapp_link: delivery.link,
          whatsappLink: delivery.link,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    return internalError(error instanceof Error ? error.message : undefined);
  }
}
