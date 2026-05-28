import type { SupabaseClient } from "@supabase/supabase-js";
import { getInventorySummaryForStore } from "@/server/inventory/service";
import { listOrdersForStore } from "@/server/orders/service";
import type { Store } from "@/server/stores/service";
import type { Database } from "@/shared/types/database";
import type { OrderStatus } from "@/shared/types/domain";

type DashboardSupabaseClient = SupabaseClient<Database>;

export type DashboardSummary = {
  lowStockVariantCount: number;
  readyToShipOrders: number;
  shippingOrders: number;
  todaySalesAmount: number;
  todayOrders: number;
  receivedOrders: number;
};

export type DashboardTrendItem = {
  label: string;
  orderCount: number;
  salesAmount: number;
};

export type DashboardPageData = {
  recentOrders: Awaited<ReturnType<typeof listOrdersForStore>>["items"];
  summary: DashboardSummary;
  trend: DashboardTrendItem[];
};

const emptySummary: DashboardSummary = {
  lowStockVariantCount: 0,
  readyToShipOrders: 0,
  shippingOrders: 0,
  todaySalesAmount: 0,
  todayOrders: 0,
  receivedOrders: 0
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

async function getTodaySalesAmount(supabase: DashboardSupabaseClient, storeId: string, startsAt: string, endsAt: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("store_id", storeId)
    .neq("status", "cancelled")
    .gte("ordered_at", startsAt)
    .lt("ordered_at", endsAt);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce((total, order) => total + order.total_amount, 0);
}

function getKstDateParts(referenceDate: Date) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(referenceDate.getTime() + kstOffsetMs);

  return {
    date: kstDate.getUTCDate(),
    month: kstDate.getUTCMonth(),
    year: kstDate.getUTCFullYear()
  };
}

function getKstDateKey(referenceDate: Date) {
  const { date, month, year } = getKstDateParts(referenceDate);

  return `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
}

function getKstDateLabel(key: string) {
  const [, month, date] = key.split("-");

  return `${Number(month)}/${Number(date)}`;
}

function getLastSevenKstDateKeys(referenceDate = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const { date, month, year } = getKstDateParts(referenceDate);

  return Array.from({ length: 7 }, (_, index) => {
    const targetDate = new Date(Date.UTC(year, month, date - 6 + index) - kstOffsetMs);

    return getKstDateKey(targetDate);
  });
}

async function getSevenDayTrend(supabase: DashboardSupabaseClient, storeId: string): Promise<DashboardTrendItem[]> {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const { date, month, year } = getKstDateParts(new Date());
  const startsAt = new Date(Date.UTC(year, month, date - 6) - kstOffsetMs).toISOString();
  const endsAt = new Date(Date.UTC(year, month, date + 1) - kstOffsetMs).toISOString();
  const keys = getLastSevenKstDateKeys();
  const trendByKey = new Map(keys.map((key) => [key, { label: getKstDateLabel(key), orderCount: 0, salesAmount: 0 }]));
  const { data, error } = await supabase
    .from("orders")
    .select("ordered_at, total_amount, status")
    .eq("store_id", storeId)
    .gte("ordered_at", startsAt)
    .lt("ordered_at", endsAt);

  if (error) {
    throw new Error(error.message);
  }

  (data ?? []).forEach((order) => {
    if (order.status === "cancelled") {
      return;
    }

    const key = getKstDateKey(new Date(order.ordered_at));
    const trend = trendByKey.get(key);

    if (trend) {
      trend.orderCount += 1;
      trend.salesAmount += order.total_amount;
    }
  });

  return keys.map((key) => trendByKey.get(key) ?? { label: getKstDateLabel(key), orderCount: 0, salesAmount: 0 });
}

export async function getDashboardSummary(supabase: DashboardSupabaseClient, store: Store | null) {
  if (!store) {
    return emptySummary;
  }

  const { startsAt, endsAt } = getKstDayRange();
  const [
    { count: todayOrders, error: todayOrdersError },
    todaySalesAmount,
    inventorySummary,
    receivedOrders,
    readyToShipOrders,
    shippingOrders
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("ordered_at", startsAt)
      .lt("ordered_at", endsAt),
    getTodaySalesAmount(supabase, store.id, startsAt, endsAt),
    getInventorySummaryForStore(supabase, store.id),
    countOrdersByStatus(supabase, store.id, "received"),
    countOrdersByStatus(supabase, store.id, "ready_to_ship"),
    countOrdersByStatus(supabase, store.id, "shipping")
  ]);

  if (todayOrdersError) {
    throw new Error(todayOrdersError.message);
  }

  return {
    lowStockVariantCount: inventorySummary.lowStockVariantCount + inventorySummary.outOfStockVariantCount,
    readyToShipOrders,
    receivedOrders,
    shippingOrders,
    todaySalesAmount,
    todayOrders: todayOrders ?? 0
  };
}

export async function getDashboardPageData(supabase: DashboardSupabaseClient, store: Store | null): Promise<DashboardPageData> {
  if (!store) {
    return {
      recentOrders: [],
      summary: emptySummary,
      trend: getLastSevenKstDateKeys().map((key) => ({ label: getKstDateLabel(key), orderCount: 0, salesAmount: 0 }))
    };
  }

  const [summary, recentOrders, trend] = await Promise.all([
    getDashboardSummary(supabase, store),
    listOrdersForStore(supabase, store.id, undefined, { page: 1, pageSize: 5 }),
    getSevenDayTrend(supabase, store.id)
  ]);

  return {
    recentOrders: recentOrders.items,
    summary,
    trend
  };
}
