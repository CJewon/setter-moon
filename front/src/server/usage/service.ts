import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";
import type { Store } from "@/server/stores/service";
import { createUsageSummary } from "@/server/usage/usage-policy";

type UsageSupabaseClient = SupabaseClient<Database>;

type UsageCountRow = {
  product_count: number;
  sku_count: number;
  monthly_order_count: number;
};

export async function getStoreUsageSummary(supabase: UsageSupabaseClient, store: Store) {
  const referenceDate = new Date();

  const { data, error } = await supabase
    .rpc("get_store_usage_counts", {
      target_store_id: store.id,
      reference_time: referenceDate.toISOString()
    })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const counts = normalizeUsageCountRow(data);

  return createUsageSummary(store.plan_id, {
    products: counts.product_count,
    skus: counts.sku_count,
    monthlyOrders: counts.monthly_order_count
  }, referenceDate);
}

function normalizeUsageCountRow(row: UsageCountRow | null): UsageCountRow {
  return {
    product_count: row?.product_count ?? 0,
    sku_count: row?.sku_count ?? 0,
    monthly_order_count: row?.monthly_order_count ?? 0
  };
}
