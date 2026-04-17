import { describe, expect, it } from "vitest";
import {
  canUpgradePlan,
  isSupportedCheckoutPlan,
  isValidPaymentCallbackStatus,
  resolveCallbackSecret,
  shouldReusePendingPayment,
} from "@/lib/payments/helpers";

describe("payment helpers", () => {
  it("accepts only supported checkout plans", () => {
    expect(isSupportedCheckoutPlan("esnaf")).toBe(true);
    expect(isSupportedCheckoutPlan("usta")).toBe(true);
    expect(isSupportedCheckoutPlan("free")).toBe(false);
  });

  it("allows only upward plan changes", () => {
    expect(canUpgradePlan("free", "esnaf")).toBe(true);
    expect(canUpgradePlan("esnaf", "usta")).toBe(true);
    expect(canUpgradePlan("usta", "esnaf")).toBe(false);
    expect(canUpgradePlan("esnaf", "esnaf")).toBe(false);
  });

  it("reuses only recent pending payments", () => {
    const now = new Date("2026-04-14T12:15:00Z").getTime();

    expect(shouldReusePendingPayment("2026-04-14T12:05:01Z", now)).toBe(true);
    expect(shouldReusePendingPayment("2026-04-14T11:59:59Z", now)).toBe(false);
    expect(shouldReusePendingPayment(undefined, now)).toBe(false);
  });

  it("resolves callback secret with proper precedence", () => {
    expect(
      resolveCallbackSecret({
        PAYMENT_CALLBACK_SECRET: "callback-secret",
        IYZICO_SECRET_KEY: "iyzico-secret",
      })
    ).toBe("callback-secret");

    expect(
      resolveCallbackSecret({
        IYZICO_SECRET_KEY: "iyzico-secret",
      })
    ).toBe("iyzico-secret");

    expect(resolveCallbackSecret({})).toBeNull();
  });

  it("validates callback statuses", () => {
    expect(isValidPaymentCallbackStatus("success")).toBe(true);
    expect(isValidPaymentCallbackStatus("failed")).toBe(true);
    expect(isValidPaymentCallbackStatus("pending")).toBe(false);
  });
});
