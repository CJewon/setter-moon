import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";
import type { StoreFormValues } from "@/features/stores/schemas/store-form-schema";

export type Store = Database["public"]["Tables"]["stores"]["Row"];

type StoreSupabaseClient = SupabaseClient<Database>;

export class StoreSchemaMissingError extends Error {
  constructor(message = "Supabase stores table is not ready.") {
    super(message);
    this.name = "StoreSchemaMissingError";
  }
}

export function isStoreSchemaMissingError(error: unknown) {
  return error instanceof StoreSchemaMissingError;
}

function isMissingStoreTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (message.includes("could not find the table") && message.includes("public.stores")) ||
    (message.includes("relation") && message.includes("stores") && message.includes("does not exist"))
  );
}

export async function getCurrentStore(supabase: StoreSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("id, owner_id, name, business_type, plan_id, memo, created_at, updated_at")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingStoreTableError(error)) {
      throw new StoreSchemaMissingError(error.message);
    }

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
    .select("id, owner_id, name, business_type, plan_id, memo, created_at, updated_at")
    .single();

  if (error && isMissingStoreTableError(error)) {
    throw new StoreSchemaMissingError(error.message);
  }

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
