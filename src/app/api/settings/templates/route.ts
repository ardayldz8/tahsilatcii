import { NextRequest, NextResponse } from "next/server";
import { badRequest, internalError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { createClient } from "@/lib/supabase/server";
import type { ReminderType } from "@/types/index";
import {
  getAuthenticatedUser,
  getRequestUserId,
  unauthorizedResponse,
} from "@/lib/supabase/auth";
import { ensureProfileExists } from "@/lib/profile/ensure";
import {
  DEFAULT_REMINDER_TEMPLATES,
  getDefaultReminderTemplateRows,
} from "@/lib/reminders/templates";
import { updateReminderTemplatesSchema } from "@/lib/validation/settings";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const user = await getAuthenticatedUser(supabase);

    if (user) {
      await ensureProfileExists(user).catch(() => false);
    }

    const { data, error } = await supabase
      .from("message_templates")
      .select("id, user_id, type, template, created_at, updated_at")
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json(getDefaultReminderTemplateRows(userId));
    }

    if (!data || data.length === 0) {
      return NextResponse.json(getDefaultReminderTemplateRows(userId));
    }

    const customTemplates = new Map(
      data.map((template) => [template.type as ReminderType, template])
    );

    const merged = (Object.keys(DEFAULT_REMINDER_TEMPLATES) as ReminderType[]).map(
      (type) =>
        customTemplates.get(type) ?? {
          id: `default-${type}`,
          user_id: userId,
          type,
          template: DEFAULT_REMINDER_TEMPLATES[type],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
    );

    return NextResponse.json(merged);
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const bodyResult = await parseJsonBody(request, updateReminderTemplatesSchema);
    if (!bodyResult.success) return bodyResult.response;

    const body = bodyResult.data;

    const payload = (Object.keys(DEFAULT_REMINDER_TEMPLATES) as ReminderType[])
      .filter((type) => typeof body.templates?.[type] === "string")
      .map((type) => ({
        user_id: userId,
        type,
        template:
          body.templates?.[type]?.trim() || DEFAULT_REMINDER_TEMPLATES[type],
        updated_at: new Date().toISOString(),
      }));

    if (payload.length === 0) {
      return badRequest("No valid templates provided");
    }

    const { data, error } = await supabase
      .from("message_templates")
      .upsert(payload, { onConflict: "user_id,type" })
      .select("id, user_id, type, template, created_at, updated_at");

    if (error) return internalError(error.message);

    return NextResponse.json(data);
  } catch {
    return internalError();
  }
}
