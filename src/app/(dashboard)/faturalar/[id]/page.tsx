import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId } from "@/lib/supabase/auth";
import InvoiceDetailClient from "@/components/dashboard/invoice-detail-client";
import type { Invoice, Customer, Reminder } from "@/types/index";

type RouteContext = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    return null;
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "*, customer:customers(id, user_id, name, phone, email, address, notes, total_debt, created_at, updated_at)"
    )
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !invoice) {
    notFound();
  }

  const normalizedInvoice: Invoice = {
    ...invoice,
    customer: Array.isArray(invoice.customer)
      ? (invoice.customer[0] as unknown as Customer)
      : invoice.customer,
  };

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("invoice_id", id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const normalizedReminders: Reminder[] = (reminders ?? []).map((r) => ({
    ...r,
    attempt_count: r.attempt_count ?? 0,
    last_attempt_at: r.last_attempt_at ?? null,
    next_retry_at: r.next_retry_at ?? null,
  }));

  return (
    <InvoiceDetailClient
      invoice={normalizedInvoice}
      reminders={normalizedReminders}
    />
  );
}
