import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId } from "@/lib/supabase/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: "Oturum acmaniz gerekiyor." }, { status: 401 });
    }

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
