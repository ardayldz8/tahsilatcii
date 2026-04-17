import { redirect } from "next/navigation";
import CustomersPageClient from "@/components/dashboard/customers-page-client";
import { getRequestUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function MusterilerPage() {
  const supabase = await createClient();
  const userId = await getRequestUserId(supabase);

  if (!userId) {
    redirect("/giris");
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <CustomersPageClient initialCustomers={customers ?? []} />;
}
