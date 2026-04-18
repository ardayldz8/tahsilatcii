import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { attachSignedPhotoUrls } from "@/lib/invoices/photos";
import type { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/types/index";
import {
  buildCollectionRateData,
  buildInvoiceStatusData,
  buildMonthlyRevenue,
  buildTopCustomers,
} from "@/lib/dashboard/stats";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface DashboardReferralSummary {
  code: string;
  total: number;
  completed: number;
  reward: string;
}

export interface DashboardCoreStats {
  totalCustomers: number;
  totalInvoices: number;
  pendingAmount: number;
  collectedAmount: number;
  overdueCount: number;
  remindersSentThisMonth: number;
}

/**
 * Core dashboard data — fast counts + sums. Renders the plan card,
 * onboarding card, and 5 stat cards immediately.
 */
export async function getDashboardCore(
  supabase: SupabaseClient,
  userId: string
) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    profileResult,
    customersResult,
    pendingInvoicesResult,
    paidInvoicesResult,
    overdueResult,
    remindersResult,
    totalInvoicesResult,
    referralsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("invoices")
      .select("amount")
      .eq("user_id", userId)
      .in("status", ["pending", "overdue"]),
    supabase
      .from("invoices")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "paid"),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "overdue"),
    supabase
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("referrals")
      .select("status, reward_type")
      .eq("referrer_id", userId),
  ]);

  if (profileResult.error || !profileResult.data) {
    return null;
  }

  const pendingAmount =
    pendingInvoicesResult.data?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0;
  const collectedAmount =
    paidInvoicesResult.data?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0;
  const referrals = referralsResult.data ?? [];

  const stats: DashboardCoreStats = {
    totalCustomers: customersResult.count ?? 0,
    totalInvoices: totalInvoicesResult.count ?? 0,
    pendingAmount,
    collectedAmount,
    overdueCount: overdueResult.count ?? 0,
    remindersSentThisMonth: remindersResult.count ?? 0,
  };

  return {
    profile: profileResult.data,
    stats,
    referrals: {
      code: profileResult.data.referral_code || "",
      total: referrals.length,
      completed: referrals.filter((r) => r.status === "completed").length,
      reward: `${referrals.filter((r) => r.reward_type === "granted").length} ay`,
    } satisfies DashboardReferralSummary,
  };
}

export async function getCachedDashboardCore(userId: string) {
  return unstable_cache(
    async () => getDashboardCore(createAdminClient(), userId),
    ["dashboard-core", userId],
    {
      revalidate: 15,
      tags: [`dashboard:${userId}`, `invoices:${userId}`, `customers:${userId}`],
    }
  )();
}

/**
 * Heavy dashboard data — chart datasets + latest invoices with signed photo URLs.
 * Streamed via <Suspense> so it doesn't block the initial paint.
 */
export async function getDashboardDeep(
  supabase: SupabaseClient,
  userId: string
) {
  const [allInvoicesResult, latestInvoicesResult] = await Promise.all([
    supabase
      .from("invoices")
      .select("amount, status, due_date, paid_at, customer_id, customers(name)")
      .eq("user_id", userId),
    supabase
      .from("invoices")
      .select(
        "id, user_id, customer_id, invoice_no, amount, due_date, status, notes, photo_url, created_at, updated_at, paid_at, customer:customers(name, phone)"
      )
      .eq("user_id", userId)
      .order("due_date", { ascending: false })
      .limit(10),
  ]);

  if (allInvoicesResult.error || latestInvoicesResult.error) {
    throw new Error("Dashboard deep data could not be loaded");
  }

  const allInvoices = allInvoicesResult.data ?? [];

  const latestInvoices: Invoice[] = await attachSignedPhotoUrls(
    (latestInvoicesResult.data ?? []).map((invoice) => ({
      ...invoice,
      customer: Array.isArray(invoice.customer)
        ? {
            id: invoice.customer_id,
            user_id: invoice.user_id,
            name: invoice.customer[0]?.name ?? "",
            phone: invoice.customer[0]?.phone ?? "",
            email: null,
            address: null,
            notes: null,
            total_debt: 0,
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
          }
        : undefined,
    }))
  );

  return {
    chartData: {
      monthlyRevenue: buildMonthlyRevenue(allInvoices),
      invoiceStatusData: buildInvoiceStatusData(allInvoices),
      collectionRateData: buildCollectionRateData(allInvoices),
      topCustomers: buildTopCustomers(allInvoices),
    },
    invoices: latestInvoices,
  };
}

export async function getCachedDashboardDeep(userId: string) {
  return unstable_cache(
    async () => getDashboardDeep(createAdminClient(), userId),
    ["dashboard-deep", userId],
    {
      revalidate: 15,
      tags: [`dashboard:${userId}`, `invoices:${userId}`, `customers:${userId}`],
    }
  )();
}

/**
 * @deprecated Prefer getCachedDashboardCore + <Suspense> + getCachedDashboardDeep
 * for streaming. Kept for any callers still relying on the combined payload.
 */
export async function getDashboardOverview(
  supabase: SupabaseClient,
  userId: string
) {
  const core = await getDashboardCore(supabase, userId);
  if (!core) return null;
  const deep = await getDashboardDeep(supabase, userId);
  return {
    profile: core.profile,
    stats: { ...core.stats, ...deep.chartData },
    invoices: deep.invoices,
    referrals: core.referrals,
  };
}

export async function getCachedDashboardOverview(userId: string) {
  return unstable_cache(
    async () => getDashboardOverview(createAdminClient(), userId),
    ["dashboard-overview", userId],
    {
      revalidate: 15,
      tags: [`dashboard:${userId}`, `invoices:${userId}`, `customers:${userId}`],
    }
  )();
}
