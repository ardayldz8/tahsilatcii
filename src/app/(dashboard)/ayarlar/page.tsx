import { redirect } from "next/navigation";
import SettingsPageClient from "@/components/dashboard/settings-page-client";
import { ensureProfileExists } from "@/lib/profile/ensure";
import { DEFAULT_REMINDER_SETTINGS, normalizeReminderChannels } from "@/lib/reminders/helpers";
import { DEFAULT_REMINDER_TEMPLATES } from "@/lib/reminders/templates";
import { getAuthenticatedUser, getRequestUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { MessageTemplate, ReminderSettings, ReminderType } from "@/types/index";

export default async function AyarlarPage() {
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    redirect("/giris");
  }

  const user = await getAuthenticatedUser(supabase);

  if (user) {
    await ensureProfileExists(user).catch(() => false);
  }

  const [profileResult, templatesResult, remindersResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("message_templates").select("id, user_id, type, template, created_at, updated_at").eq("user_id", userId),
    supabase.from("reminder_settings").select("enabled, days_before, days_after, due_day, channels").eq("user_id", userId).maybeSingle(),
  ]);

  if (profileResult.error || !profileResult.data) {
    redirect("/giris");
  }

  const templatesMap = { ...DEFAULT_REMINDER_TEMPLATES };
  const templateRows: MessageTemplate[] = Array.isArray(templatesResult.data) ? templatesResult.data : [];
  for (const template of templateRows) {
    templatesMap[template.type as ReminderType] = template.template;
  }

  const initialReminderSettings: ReminderSettings = remindersResult.data
    ? {
        enabled: remindersResult.data.enabled,
        days_before: remindersResult.data.days_before,
        days_after: remindersResult.data.days_after,
        due_day: remindersResult.data.due_day,
        channels: normalizeReminderChannels(remindersResult.data.channels),
      }
    : DEFAULT_REMINDER_SETTINGS;

  return (
    <SettingsPageClient
      initialProfile={profileResult.data}
      initialTemplates={templatesMap}
      initialReminderSettings={initialReminderSettings}
    />
  );
}
