import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  getRequestUserId,
  unauthorizedResponse,
} from "@/lib/supabase/auth";
import { ensureProfileExists } from "@/lib/profile/ensure";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const user = await getAuthenticatedUser(supabase);

    if (user) {
      await ensureProfileExists(user).catch(() => false);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data)
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const { full_name, phone, business_name, business_type } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (business_name !== undefined) updates.business_name = business_name;
    if (business_type !== undefined) updates.business_type = business_type;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
