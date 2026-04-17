import PanelPageClient from "@/components/dashboard/panel-page-client";
import { getCachedDashboardOverview, getDashboardOverview } from "@/lib/dashboard/overview";
import { getAuthenticatedUser, getRequestUserId } from "@/lib/supabase/auth";
import { ensureProfileExists } from "@/lib/profile/ensure";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PanelPage() {
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    redirect("/giris");
  }

  const user = await getAuthenticatedUser(supabase);

  if (user) {
    await ensureProfileExists(user).catch(() => false);
  }

  let overview = await getCachedDashboardOverview(userId);

  if (!overview) {
    overview = await getDashboardOverview(supabase, userId);
  }

  if (!overview) {
    redirect("/ayarlar");
  }

  return (
    <PanelPageClient
      profile={overview.profile}
      stats={overview.stats}
      invoices={overview.invoices}
      referrals={overview.referrals}
    />
  );
}
