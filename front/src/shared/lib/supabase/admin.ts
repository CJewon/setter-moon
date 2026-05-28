import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerAuthKey, getSupabaseUrl } from "@/shared/lib/env";
import type { Database } from "@/shared/types/database";

export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServerAuthKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}
