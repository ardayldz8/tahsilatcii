import InvoicesPageClient from "@/components/dashboard/invoices-page-client";
import { attachSignedPhotoUrls } from "@/lib/invoices/photos";
import { getRequestUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/types/index";

export default async function FaturalarPage() {
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, user_id, customer_id, invoice_no, amount, due_date, status, notes, photo_url, created_at, updated_at, paid_at, customer:customers(name, phone)"
    )
    .eq("user_id", userId)
    .order("due_date", { ascending: false });

  const initialInvoices: Invoice[] = error
    ? []
    : await attachSignedPhotoUrls(
        ((data ?? []).map((invoice) => ({
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
        })) as Invoice[])
      );

  return (
    <InvoicesPageClient initialInvoices={initialInvoices} />
  );
}
