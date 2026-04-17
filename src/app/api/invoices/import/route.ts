import { NextRequest, NextResponse } from "next/server";
import { internalError } from "@/lib/api/errors";
import { parseJsonBody } from "@/lib/api/validation";
import { safeRevalidateTags } from "@/lib/cache";
import { generateInvoiceNo } from "@/lib/invoices/helpers";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import { importInvoicesSchema } from "@/lib/validation/invoices";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const bodyResult = await parseJsonBody(request, importInvoicesSchema);
    if (!bodyResult.success) return bodyResult.response;

    const rows = bodyResult.data;

    const { data: customers } = await supabase
      .from("customers")
      .select("id, name")
      .eq("user_id", userId);

    const customerMap = new Map(
      (customers ?? []).map((c) => [c.name.toLowerCase().trim(), c.id])
    );

    const results: {
      success: number;
      failed: number;
      errors: { row: number; message: string }[];
    } = { success: 0, failed: 0, errors: [] };

    const customerDebtUpdates = new Map<string, number>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.customer_name || !row.amount || !row.due_date) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          message: "customer_name, amount, and due_date are required",
        });
        continue;
      }

      const amount = Number(row.amount);
      if (isNaN(amount) || amount <= 0) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          message: "Invalid amount",
        });
        continue;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(row.due_date)) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          message: "due_date must be in YYYY-MM-DD format",
        });
        continue;
      }

      const customerId = customerMap.get(
        row.customer_name.toLowerCase().trim()
      );

      if (!customerId) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          message: `Customer "${row.customer_name}" not found`,
        });
        continue;
      }

      const { error } = await supabase.from("invoices").insert({
        user_id: userId,
        customer_id: customerId,
        invoice_no: generateInvoiceNo(),
        amount,
        due_date: row.due_date,
        status: "pending",
        notes: row.notes || null,
      });

      if (error) {
        results.failed++;
        results.errors.push({ row: i + 1, message: error.message });
        continue;
      }

      results.success++;
      const currentDebt = customerDebtUpdates.get(customerId) ?? 0;
      customerDebtUpdates.set(customerId, currentDebt + amount);
    }

    for (const [customerId, addedDebt] of customerDebtUpdates) {
      const { data: customer } = await supabase
        .from("customers")
        .select("total_debt")
        .eq("id", customerId)
        .single();

      if (customer) {
        await supabase
          .from("customers")
          .update({
            total_debt: (customer.total_debt || 0) + addedDebt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
      }
    }

    safeRevalidateTags([
      `invoices:${userId}`,
      `customers:${userId}`,
      `dashboard:${userId}`,
    ]);

    return NextResponse.json(results, {
      status: results.failed > 0 && results.success === 0 ? 400 : 200,
    });
  } catch {
    return internalError();
  }
}
