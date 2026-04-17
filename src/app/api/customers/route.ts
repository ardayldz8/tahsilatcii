import { NextRequest, NextResponse } from "next/server";
import { forbidden, internalError, notFound } from "@/lib/api/errors";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validation";
import { safeRevalidateTags } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/types/index";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import {
  createCustomerSchema,
  customersQuerySchema,
} from "@/lib/validation/customers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const queryResult = parseSearchParams(request, customersQuerySchema);
    if (!queryResult.success) return queryResult.response;

    const compact = queryResult.data.compact === "1";

    const { data, error } = await supabase
      .from("customers")
      .select(compact ? "id, name" : "*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return internalError(error.message);

    return NextResponse.json(data);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (!profile) return notFound("Profile not found");

    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const limits = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];
    if ((customerCount ?? 0) >= limits.maxCustomers)
      return forbidden(
        "Musteri limitinize ulastiniz. Daha fazla musteri eklemek icin planinizi yukseltin.",
        { maxCustomers: limits.maxCustomers }
      );

    const bodyResult = await parseJsonBody(request, createCustomerSchema);
    if (!bodyResult.success) return bodyResult.response;

    const { name, phone, email, address, notes } = bodyResult.data;

    const { data, error } = await supabase
      .from("customers")
        .insert({
        user_id: userId,
        name,
        phone,
        email: email || null,
        address: address || null,
        notes: notes || null,
        total_debt: 0,
      })
      .select()
      .single();

    if (error) return internalError(error.message);

    safeRevalidateTags([
      `customers:${userId}`,
      `invoices:${userId}`,
      `dashboard:${userId}`,
    ]);

    return NextResponse.json(data, { status: 201 });
  } catch {
    return internalError();
  }
}
