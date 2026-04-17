import { NextRequest, NextResponse } from "next/server";
import { internalError, notFound } from "@/lib/api/errors";
import { parseJsonBody, parseRouteParams } from "@/lib/api/validation";
import { safeRevalidateTags } from "@/lib/cache";
import { attachPublicPhotoUrl } from "@/lib/invoices/photos";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import { uuidParamsSchema } from "@/lib/validation/common";
import { updateInvoiceSchema } from "@/lib/validation/invoices";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const paramsResult = await parseRouteParams(context.params, uuidParamsSchema);
    if (!paramsResult.success) return paramsResult.response;

    const { id } = paramsResult.data;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data, error } = await supabase
      .from("invoices")
      .select("*, customer:customers(name, phone, email)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) return notFound("Invoice not found");

    return NextResponse.json(await attachPublicPhotoUrl(data));
  } catch {
    return internalError();
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const paramsResult = await parseRouteParams(context.params, uuidParamsSchema);
    if (!paramsResult.success) return paramsResult.response;

    const { id } = paramsResult.data;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data: existing } = await supabase
      .from("invoices")
      .select("*, customers(id, total_debt)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existing) return notFound("Invoice not found");

    const bodyResult = await parseJsonBody(request, updateInvoiceSchema);
    if (!bodyResult.success) return bodyResult.response;

    const body = bodyResult.data;
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.photo_url !== undefined) updates.photo_url = body.photo_url;
    if (body.amount !== undefined) updates.amount = Number(body.amount);
    if (body.due_date !== undefined) updates.due_date = body.due_date;

    if (body.status === "paid" && existing.status !== "paid") {
      updates.paid_at = new Date().toISOString();

      const customerData = existing.customers as { id: string; total_debt: number } | null;
      if (customerData) {
        await supabase
          .from("customers")
          .update({
            total_debt: Math.max(0, (customerData.total_debt || 0) - existing.amount),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.customer_id);
      }
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*, customer:customers(name, phone)")
      .single();

    if (error) return internalError(error.message);

    safeRevalidateTags([
      `invoices:${userId}`,
      `dashboard:${userId}`,
      `customers:${userId}`,
    ]);

    return NextResponse.json(await attachPublicPhotoUrl(data));
  } catch {
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const paramsResult = await parseRouteParams(context.params, uuidParamsSchema);
    if (!paramsResult.success) return paramsResult.response;

    const { id } = paramsResult.data;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, customers(id, total_debt)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!invoice) return notFound("Invoice not found");

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return internalError(error.message);

    if (invoice.status !== "paid" && invoice.status !== "cancelled") {
      const customerData = invoice.customers as { id: string; total_debt: number } | null;
      if (customerData) {
        await supabase
          .from("customers")
          .update({
            total_debt: Math.max(0, (customerData.total_debt || 0) - invoice.amount),
            updated_at: new Date().toISOString(),
          })
          .eq("id", invoice.customer_id);
      }
    }

    safeRevalidateTags([
      `invoices:${userId}`,
      `dashboard:${userId}`,
      `customers:${userId}`,
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return internalError();
  }
}
