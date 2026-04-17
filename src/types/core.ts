export type BusinessType =
  | "tesisatci"
  | "elektrikci"
  | "boyaci"
  | "klimaci"
  | "oto_tamirci"
  | "diger";

export type PlanType = "free" | "esnaf" | "usta";

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export type ReminderChannel = "whatsapp" | "sms" | "email";

export type ReminderStatus = "pending" | "sent" | "delivered" | "failed";

export type ReminderType =
  | "vade-oncesi"
  | "vade-gunu"
  | "vade-sonrasi"
  | "hatirlatma"
  | "manuel";

export type ReminderProvider = "whatsapp" | "sms" | "email" | "none";
