import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";
import type { StoreFormValues } from "@/features/stores/schemas/store-form-schema";

export type Store = Database["public"]["Tables"]["stores"]["Row"];

type StoreSupabaseClient = SupabaseClient<Database>;

export async function getCurrentStore(supabase: StoreSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("id, owner_id, name, business_type, memo, created_at, updated_at")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createStoreForUser(supabase: StoreSupabaseClient, userId: string, values: StoreFormValues) {
  const existingStore = await getCurrentStore(supabase, userId);

  if (existingStore) {
    return existingStore;
  }

  const { data, error } = await supabase
    .from("stores")
    .insert({
      owner_id: userId,
      name: values.name.trim(),
      business_type: values.businessType || null,
      memo: values.memo?.trim() || null
    })
    .select("id, owner_id, name, business_type, memo, created_at, updated_at")
    .single();

  if (error?.code === "23505") {
    const store = await getCurrentStore(supabase, userId);

    if (store) {
      return store;
    }
  }

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
