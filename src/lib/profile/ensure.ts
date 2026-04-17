import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";

export async function ensureProfileExists(user: User) {
  const supabase = await createServiceClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return true;
  }

  const metadata = user.user_metadata ?? {};

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    full_name:
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : "",
    business_name:
      typeof metadata.business_name === "string" ? metadata.business_name : "",
    business_type: "diger",
  });

  return !error;
}
