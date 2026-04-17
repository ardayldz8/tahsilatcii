import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_PRICES, type PlanType } from "@/types/index";
import {
  canUpgradePlan,
  isSupportedCheckoutPlan,
  shouldReusePendingPayment,
} from "@/lib/payments/helpers";
import { createIyzicoCheckout } from "@/lib/payments/iyzico";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";

function getCheckoutBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const { plan } = body as { plan: PlanType };

    if (!plan || !isSupportedCheckoutPlan(plan))
      return NextResponse.json(
        { error: "Invalid plan. Must be 'esnaf' or 'usta'" },
        { status: 400 }
      );

    const price = PLAN_PRICES[plan];

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.plan === plan) {
      return NextResponse.json(
        { error: "You are already on this plan." },
        { status: 409 }
      );
    }

    if (!canUpgradePlan(profile.plan as PlanType, plan)) {
      return NextResponse.json(
        { error: "Only plan upgrades are supported right now." },
        { status: 400 }
      );
    }

    const { data: pendingPayment } = await supabase
      .from("payments")
      .select("id, iyzico_payment_id, created_at")
      .eq("user_id", userId)
      .eq("plan", plan)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingPayment && shouldReusePendingPayment(pendingPayment.created_at)) {
      return NextResponse.json({
        message: "Existing pending checkout reused",
        plan,
        amount: price,
        currency: "TRY",
        paymentId: pendingPayment.id,
        providerReference: pendingPayment.iyzico_payment_id,
        checkoutUrl: null,
        mode: "pending",
      });
    }

    const providerReference = crypto.randomUUID();

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        plan,
        amount: price,
        currency: "TRY",
        status: "pending",
        iyzico_payment_id: providerReference,
      })
      .select("id, plan, amount, currency, iyzico_payment_id")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: paymentError?.message || "Payment could not be created." },
        { status: 500 }
      );
    }

    const hasIyzicoConfig = Boolean(
      process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY
    );

    if (!hasIyzicoConfig) {
      return NextResponse.json(
        {
          error: "Payment provider is not configured yet.",
          plan,
          amount: price,
          currency: "TRY",
          paymentId: payment.id,
          providerReference,
          checkoutUrl: null,
          mode: "configuration_required",
        },
        { status: 503 }
      );
    }

    const { data: fullProfile } = await supabase
      .from("profiles")
      .select("email, full_name, phone")
      .eq("id", userId)
      .single();

    if (!fullProfile?.email || !fullProfile?.full_name) {
      return NextResponse.json(
        { error: "Profile is incomplete. Please complete your profile first." },
        { status: 400 }
      );
    }

    const callbackBaseUrl = getCheckoutBaseUrl(request);
    const callbackUrl = `${callbackBaseUrl}/api/payments/callback?payment_id=${payment.id}`;

    try {
      const iyzicoResult = await createIyzicoCheckout({
        plan,
        userId,
        userEmail: fullProfile.email,
        userName: fullProfile.full_name,
        userPhone: fullProfile.phone || "",
        callbackUrl,
      });

      await supabase
        .from("payments")
        .update({ iyzico_payment_id: iyzicoResult.token })
        .eq("id", payment.id);

      return NextResponse.json({
        message: "Checkout session created",
        plan,
        amount: price,
        currency: "TRY",
        paymentId: payment.id,
        providerReference: iyzicoResult.token,
        checkoutUrl: iyzicoResult.checkoutUrl,
        mode: "provider_redirect",
      });
    } catch (iyzicoError) {
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);

      return NextResponse.json(
        {
          error: `Payment provider error: ${iyzicoError instanceof Error ? iyzicoError.message : "Unknown error"}`,
          plan,
          amount: price,
          currency: "TRY",
          paymentId: payment.id,
          checkoutUrl: null,
          mode: "provider_error",
        },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
