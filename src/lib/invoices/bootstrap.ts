import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { attachPublicPhotoUrls } from "@/lib/invoices/photos";
import type { Invoice } from "@/types/index";

export async function getInvoicesBootstrap(userId: string): Promise<Invoice[]> {
  const supabase = createAdminClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, user_id, customer_id, invoice_no, amount, due_date, status, notes, photo_url, created_at, updated_at, paid_at, customer:customers(name, phone)"
    )
    .eq("user_id", userId)
    .order("due_date", { ascending: false });

  return attachPublicPhotoUrls((invoices ?? []).map((invoice) => ({
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
  })));
}

export async function getCachedInvoicesBootstrap(userId: string) {
  return unstable_cache(async () => getInvoicesBootstrap(userId), ["invoices-bootstrap", userId], {
    revalidate: 15,
    tags: [`invoices:${userId}`, `customers:${userId}`],
  })();
}
