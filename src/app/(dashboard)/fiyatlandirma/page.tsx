import { redirect } from "next/navigation";
import PricingPageClient from "@/components/dashboard/pricing-page-client";
import { ensureProfileExists } from "@/lib/profile/ensure";
import { getAuthenticatedUser, getRequestUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function FiyatlandirmaPage() {
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    redirect("/giris");
  }

  const user = await getAuthenticatedUser(supabase);

  if (user) {
    await ensureProfileExists(user).catch(() => false);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return <PricingPageClient initialProfile={(profile ?? null) as Profile | null} />;
}
