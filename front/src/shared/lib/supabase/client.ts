import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/shared/lib/env";
import type { Database } from "@/shared/types/database";

export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublishableKey());
}
