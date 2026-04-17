import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_PRICES, type PlanType } from "@/types/index";
import {
  isValidPaymentCallbackStatus,
  resolveCallbackSecret,
} from "@/lib/payments/helpers";
import { retrieveIyzicoCheckoutResult, isIyzicoConfigured } from "@/lib/payments/iyzico";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const status = request.nextUrl.searchParams.get("status");

  if (!token && !status) {
    return NextResponse.redirect(new URL("/panel?odeme=done", request.url));
  }

  if (status === "failure") {
    return NextResponse.redirect(
      new URL("/fiyatlandirma?odeme=failed", request.url)
    );
  }

  if (token && isIyzicoConfigured()) {
    try {
      const result = await retrieveIyzicoCheckoutResult(token);

      if (result.status === "success") {
        return NextResponse.redirect(
          new URL("/panel?odeme=success", request.url)
        );
      } else {
        return NextResponse.redirect(
          new URL("/fiyatlandirma?odeme=failed", request.url)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL("/fiyatlandirma?odeme=error", request.url)
      );
    }
  }

  return NextResponse.redirect(new URL("/panel?odeme=done", request.url));
}

export async function POST(request: NextRequest) {
  try {
    const callbackSecret = resolveCallbackSecret(process.env);
    const providedSecret = request.headers.get("x-payment-callback-secret");

    if (!callbackSecret || providedSecret !== callbackSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }

    const {
      user_id,
      plan,
      payment_id,
      status,
    } = body as {
      user_id?: string;
      plan?: string;
      payment_id?: string;
      status?: string;
    };

    if (!user_id || !plan || !status)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    if (!["free", "esnaf", "usta"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!isValidPaymentCallbackStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const amount = PLAN_PRICES[plan as PlanType];

    let paymentQuery = supabase
      .from("payments")
      .select("id, status, plan")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (payment_id) {
      paymentQuery = paymentQuery.eq("iyzico_payment_id", payment_id);
    } else {
      paymentQuery = paymentQuery.eq("plan", plan).eq("status", "pending");
    }

    const { data: existingPayment, error: existingPaymentError } =
      await paymentQuery.maybeSingle();

    if (existingPaymentError) {
      return NextResponse.json(
        { error: existingPaymentError.message },
        { status: 500 }
      );
    }

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (existingPayment.status !== "pending") {
      return NextResponse.json({ success: true, duplicate: true });
    }

    if (status === "success") {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          plan: plan as PlanType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user_id);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }

      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          plan: plan as PlanType,
          amount,
          currency: "TRY",
          status: "completed",
          iyzico_payment_id: payment_id || existingPayment.id,
        })
        .eq("id", existingPayment.id);

      if (paymentUpdateError) {
        return NextResponse.json(
          { error: paymentUpdateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          plan: plan as PlanType,
          amount,
          currency: "TRY",
          status: "failed",
          iyzico_payment_id: payment_id || existingPayment.id,
        })
        .eq("id", existingPayment.id);

      if (paymentUpdateError) {
        return NextResponse.json(
          { error: paymentUpdateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
