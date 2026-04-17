import { redirect } from "next/navigation";
import RemindersPageClient from "@/components/dashboard/reminders-page-client";
import { getRequestUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { Reminder } from "@/types";

export default async function HatirlatmalarPage() {
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    redirect("/giris");
  }

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <RemindersPageClient initialReminders={(reminders ?? []) as Reminder[]} />
  );
}
