import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentStore, isStoreSchemaMissingError } from "@/server/stores/service";
import type { Database } from "@/shared/types/database";

export async function getPostAuthRedirectPath(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return "/sign-in";
  }

  try {
    const store = await getCurrentStore(supabase, user.id);

    return store ? "/dashboard" : "/onboarding/store";
  } catch (error) {
    if (isStoreSchemaMissingError(error)) {
      return "/onboarding/store";
    }

    throw error;
  }
}
