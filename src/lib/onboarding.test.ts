import { describe, expect, it } from "vitest";
import { getOnboardingSteps } from "@/lib/onboarding";

describe("onboarding helper", () => {
  it("marks all steps incomplete for a brand new account", () => {
    const result = getOnboardingSteps({ profile: null, stats: null });

    expect(result.completedCount).toBe(0);
    expect(result.isComplete).toBe(false);
  });

  it("marks steps complete based on profile and stats", () => {
    const result = getOnboardingSteps({
      profile: {
        id: "u1",
        email: "arda@example.com",
        phone: "0555",
        full_name: "Arda",
        business_name: "Arda Tesisat",
        business_type: "tesisatci",
        plan: "free",
        referral_code: null,
        referred_by: null,
        created_at: "2026-04-14",
        updated_at: "2026-04-14",
      },
      stats: {
        totalCustomers: 1,
        totalInvoices: 1,
        pendingAmount: 100,
        collectedAmount: 0,
        overdueCount: 0,
        remindersSentThisMonth: 1,
        monthlyRevenue: [],
        invoiceStatusData: [],
        collectionRateData: [],
        topCustomers: [],
      },
    });

    expect(result.completedCount).toBe(4);
    expect(result.isComplete).toBe(true);
  });
});
