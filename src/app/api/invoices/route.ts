import { NextRequest, NextResponse } from "next/server";
import { internalError, notFound } from "@/lib/api/errors";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validation";
import { attachSignedPhotoUrl, attachSignedPhotoUrls } from "@/lib/invoices/photos";
import { getCachedInvoicesBootstrap } from "@/lib/invoices/bootstrap";
import { generateInvoiceNo } from "@/lib/invoices/helpers";
import { safeRevalidateTags } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import {
  createInvoiceSchema,
  invoicesQuerySchema,
} from "@/lib/validation/invoices";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const queryResult = parseSearchParams(request, invoicesQuerySchema);
    if (!queryResult.success) return queryResult.response;

    const { status, limit } = queryResult.data;
    const compact = queryResult.data.compact === "1";

    if (compact && !status && !limit) {
      return NextResponse.json(await getCachedInvoicesBootstrap(userId));
    }

    let query = supabase
      .from("invoices")
      .select(
        compact
          ? "id, user_id, customer_id, invoice_no, amount, due_date, status, photo_url, created_at, updated_at, paid_at, customer:customers(name, phone)"
          : "*, customer:customers(name, phone)"
      )
      .eq("user_id", userId)
      .order("due_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) return internalError(error.message);

    return NextResponse.json(
      await attachSignedPhotoUrls((data ?? []) as unknown as Array<{ photo_url: string | null }>)
    );
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const bodyResult = await parseJsonBody(request, createInvoiceSchema);
    if (!bodyResult.success) return bodyResult.response;

    const { customer_id, amount, due_date, notes } = bodyResult.data;

    const { data: customer } = await supabase
      .from("customers")
      .select("id, total_debt")
      .eq("id", customer_id)
      .eq("user_id", userId)
      .single();

    if (!customer) return notFound("Customer not found");

    const invoice_no = generateInvoiceNo();

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        customer_id,
        invoice_no,
        amount: Number(amount),
        due_date,
        status: "pending",
        notes: notes || null,
      })
      .select("*, customer:customers(name, phone)")
      .single();

    if (error) return internalError(error.message);

    await supabase
      .from("customers")
      .update({
        total_debt: (customer.total_debt || 0) + Number(amount),
        updated_at: new Date().toISOString(),
      })
      .eq("id", customer_id);

    safeRevalidateTags([
      `invoices:${userId}`,
      `dashboard:${userId}`,
      `customers:${userId}`,
    ]);

    return NextResponse.json(await attachSignedPhotoUrl(data), { status: 201 });
  } catch {
    return internalError();
  }
}
