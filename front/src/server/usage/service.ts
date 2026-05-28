import type { SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "@/server/stores/service";
import { createUsageSummary, type UsageSummary } from "@/server/usage/usage-policy";
import type { Database } from "@/shared/types/database";

type UsageSupabaseClient = SupabaseClient<Database>;

export type StoreUsageCounts = {
  productCount: number;
  skuCount: number;
  monthlyOrderCount: number;
};

export async function getStoreUsageCounts(supabase: UsageSupabaseClient, storeId: string): Promise<StoreUsageCounts> {
  const { data, error } = await supabase.rpc("get_store_usage_counts", {
    target_store_id: storeId
  });

  if (error) {
    throw new Error(error.message);
  }

  const usage = data?.[0];

  return {
    productCount: usage?.product_count ?? 0,
    skuCount: usage?.sku_count ?? 0,
    monthlyOrderCount: usage?.monthly_order_count ?? 0
  };
}

export async function getStoreUsageSummary(
  supabase: UsageSupabaseClient,
  store: Store,
  planId: "free" | "paid_full"
): Promise<UsageSummary> {
  const counts = await getStoreUsageCounts(supabase, store.id);

  return createUsageSummary(planId, {
    products: counts.productCount,
    skus: counts.skuCount,
    monthlyOrders: counts.monthlyOrderCount
  });
}
