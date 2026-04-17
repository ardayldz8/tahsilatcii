import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { unauthorized } from "@/lib/api/errors";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
const authUserCache = new WeakMap<object, Promise<User | null>>();

export async function getAuthenticatedUser(supabase: SupabaseClient) {
  const authRef = supabase.auth as object;
  const cached = authUserCache.get(authRef);

  if (cached) {
    return cached;
  }

  const userPromise = supabase.auth
    .getUser()
    .then(({ data }) => data.user ?? null)
    .catch(() => null);

  authUserCache.set(authRef, userPromise);
  return userPromise;
}

export async function getRequestUserId(supabase: SupabaseClient) {
  const user = await getAuthenticatedUser(supabase);
  return user?.id ?? null;
}

export function unauthorizedResponse() {
  return unauthorized();
}
