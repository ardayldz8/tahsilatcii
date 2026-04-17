import type {
  BusinessType,
  InvoiceStatus,
  PlanType,
  ReminderChannel,
  ReminderProvider,
  ReminderStatus,
  ReminderType,
} from "@/types/core";

export interface Profile {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  business_name: string;
  business_type: BusinessType;
  plan: PlanType;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  total_debt: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_no: string;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  photo_url: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface Reminder {
  id: string;
  invoice_id: string;
  user_id: string;
  customer_name: string;
  invoice_no: string;
  channel: ReminderChannel;
  type: ReminderType;
  status: ReminderStatus;
  message: string;
  provider: ReminderProvider;
  error_message: string | null;
  attempt_count: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan: PlanType;
  amount: number;
  currency: string;
  status: string;
  iyzico_payment_id: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  type: ReminderType;
  template: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  reward_type: string;
  created_at: string;
}
