import { Suspense } from "react";
import { redirect } from "next/navigation";
import PageHeader from "@/components/layout/page-header";
import PanelCoreSection from "@/components/dashboard/panel-core-section";
import PanelChartsSection from "@/components/dashboard/panel-charts-section";
import PanelActivitySection from "@/components/dashboard/panel-activity-section";
import PanelDeepSkeleton from "@/components/dashboard/panel-deep-skeleton";
import {
  getCachedDashboardCore,
  getCachedDashboardDeep,
  type DashboardReferralSummary,
} from "@/lib/dashboard/overview";
import { getAuthenticatedUser, getRequestUserId } from "@/lib/supabase/auth";
import { ensureProfileExists } from "@/lib/profile/ensure";
import { createClient } from "@/lib/supabase/server";

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

  const core = await getCachedDashboardCore(userId);
  if (!core) {
    redirect("/ayarlar");
  }

  const firstName = core.profile.full_name?.split(" ")[0] || "Kullanici";
  const title = `Merhaba, ${firstName}`;
  const description = core.profile.business_name || "";

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="w-full space-y-5 p-4 md:p-6">
        <PanelCoreSection profile={core.profile} stats={core.stats} />
        <Suspense fallback={<PanelDeepSkeleton />}>
          <PanelDeepSection userId={userId} referrals={core.referrals} />
        </Suspense>
      </div>
    </>
  );
}

async function PanelDeepSection({
  userId,
  referrals,
}: {
  userId: string;
  referrals: DashboardReferralSummary;
}) {
  const deep = await getCachedDashboardDeep(userId);
  return (
    <>
      <PanelChartsSection data={deep.chartData} />
      <PanelActivitySection invoices={deep.invoices} referrals={referrals} />
    </>
  );
}
