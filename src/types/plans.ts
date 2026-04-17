import type { PlanType, ReminderChannel } from "@/types/core";

export const PLAN_LIMITS: Record<
  PlanType,
  { maxCustomers: number; maxReminders: number; channels: ReminderChannel[] }
> = {
  free: { maxCustomers: 3, maxReminders: 10, channels: ["whatsapp"] },
  esnaf: {
    maxCustomers: 25,
    maxReminders: Infinity,
    channels: ["whatsapp", "sms"],
  },
  usta: {
    maxCustomers: Infinity,
    maxReminders: Infinity,
    channels: ["whatsapp", "sms", "email"],
  },
};

export const PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  esnaf: 99,
  usta: 199,
};
