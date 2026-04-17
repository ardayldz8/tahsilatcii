import type { PlanType } from "@/types/index";

export const PLAN_ORDER: Record<PlanType, number> = {
  free: 0,
  esnaf: 1,
  usta: 2,
};

export function isSupportedCheckoutPlan(plan: string): plan is Exclude<PlanType, "free"> {
  return plan === "esnaf" || plan === "usta";
}

export function canUpgradePlan(currentPlan: PlanType, requestedPlan: PlanType) {
  return PLAN_ORDER[requestedPlan] > PLAN_ORDER[currentPlan];
}

export function shouldReusePendingPayment(
  createdAt: string | null | undefined,
  now = Date.now(),
  reuseWindowMs = 15 * 60 * 1000
) {
  if (!createdAt) {
    return false;
  }

  const createdAtMs = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  return now - createdAtMs < reuseWindowMs;
}

export function resolveCallbackSecret(
  env: Record<string, string | undefined>
) {
  return env.PAYMENT_CALLBACK_SECRET || env.IYZICO_SECRET_KEY || null;
}

export function isValidPaymentCallbackStatus(status: string) {
  return status === "success" || status === "failed";
}
