import type { SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "@/server/stores/service";
import type { Database } from "@/shared/types/database";
import type { OrderStatus } from "@/shared/types/domain";

type DashboardSupabaseClient = SupabaseClient<Database>;

export type DashboardSummary = {
  todayOrders: number;
  receivedOrders: number;
  readyToShipOrders: number;
  shippingOrders: number;
};

const emptySummary: DashboardSummary = {
  todayOrders: 0,
  receivedOrders: 0,
  readyToShipOrders: 0,
  shippingOrders: 0
};

function getKstDayRange(referenceDate = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(referenceDate.getTime() + kstOffsetMs);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth();
  const date = kstDate.getUTCDate();
  const startsAt = new Date(Date.UTC(year, month, date) - kstOffsetMs);
  const endsAt = new Date(Date.UTC(year, month, date + 1) - kstOffsetMs);

  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString()
  };
}

async function countOrdersByStatus(
  supabase: DashboardSupabaseClient,
  storeId: string,
  status: OrderStatus
) {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("status", status);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getDashboardSummary(supabase: DashboardSupabaseClient, store: Store | null) {
  if (!store) {
    return emptySummary;
  }

  const { startsAt, endsAt } = getKstDayRange();
  const { count: todayOrders, error: todayOrdersError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("ordered_at", startsAt)
    .lt("ordered_at", endsAt);

  if (todayOrdersError) {
    throw new Error(todayOrdersError.message);
  }

  const [receivedOrders, readyToShipOrders, shippingOrders] = await Promise.all([
    countOrdersByStatus(supabase, store.id, "received"),
    countOrdersByStatus(supabase, store.id, "ready_to_ship"),
    countOrdersByStatus(supabase, store.id, "shipping")
  ]);

  return {
    todayOrders: todayOrders ?? 0,
    receivedOrders,
    readyToShipOrders,
    shippingOrders
  };
}
