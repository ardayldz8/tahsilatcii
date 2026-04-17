import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, full_name, email, phone, business_name, business_type, referred_by } = body;

    if (!user_id || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const profileData: Record<string, unknown> = {
      id: user_id,
      full_name: full_name || "",
      email,
      phone: phone || "",
      business_name: business_name || "",
      business_type: business_type || "diger",
    };

    if (referred_by) {
      profileData.referred_by = referred_by;
    }

    const { error } = await supabase.from("profiles").upsert(profileData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
