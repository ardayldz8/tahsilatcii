import { NextRequest, NextResponse } from "next/server";
import { internalError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import type { ReminderSettings } from "@/types/index";
import {
  DEFAULT_REMINDER_SETTINGS,
  normalizeReminderChannels,
} from "@/lib/reminders/helpers";
import { updateReminderSettingsSchema } from "@/lib/validation/settings";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data, error } = await supabase
      .from("reminder_settings")
      .select("enabled, days_before, days_after, due_day, channels")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return internalError(error.message);

    if (!data) {
      return NextResponse.json(DEFAULT_REMINDER_SETTINGS);
    }

    return NextResponse.json({
      enabled: data.enabled,
      days_before: data.days_before,
      days_after: data.days_after,
      due_day: data.due_day,
      channels: normalizeReminderChannels(data.channels),
    });
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const bodyResult = await parseJsonBody(request, updateReminderSettingsSchema);
    if (!bodyResult.success) return bodyResult.response;

    const body = bodyResult.data as Partial<ReminderSettings>;
    const payload = {
      user_id: userId,
      enabled:
        typeof body.enabled === "boolean"
          ? body.enabled
          : DEFAULT_REMINDER_SETTINGS.enabled,
      days_before:
        typeof body.days_before === "number" && body.days_before >= 0
          ? body.days_before
          : DEFAULT_REMINDER_SETTINGS.days_before,
      days_after:
        typeof body.days_after === "number" && body.days_after >= 0
          ? body.days_after
          : DEFAULT_REMINDER_SETTINGS.days_after,
      due_day:
        typeof body.due_day === "boolean"
          ? body.due_day
          : DEFAULT_REMINDER_SETTINGS.due_day,
      channels: normalizeReminderChannels(body.channels),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("reminder_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select("enabled, days_before, days_after, due_day, channels")
      .single();

    if (error) return internalError(error.message);

    return NextResponse.json({
      ...data,
      channels: normalizeReminderChannels(data.channels),
    });
  } catch {
    return internalError();
  }
}
