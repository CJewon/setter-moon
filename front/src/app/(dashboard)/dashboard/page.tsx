import Link from "next/link";
import { getDashboardPageData } from "@/server/dashboard/summary";
import { requireDashboardAccess } from "@/server/auth/session";
import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
import { formatNumber, formatWon } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

export default async function DashboardPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const dashboard = await getDashboardPageData(supabase, access.store);
  const maxTrendSales = Math.max(...dashboard.trend.map((item) => item.salesAmount), 1);
  const summaryCards = [
    { label: "오늘 주문", value: formatNumber(dashboard.summary.todayOrders), helper: "주문일 기준" },
    { label: "오늘 판매금액", value: formatWon(dashboard.summary.todaySalesAmount), helper: "취소 주문 제외" },
    { label: "재고 부족 옵션", value: formatNumber(dashboard.summary.lowStockVariantCount), helper: "품절 포함" },
    { label: "배송대기", value: formatNumber(dashboard.summary.readyToShipOrders), helper: "재고 차감 완료" }
  ];

  return (
    <>
      <PageHeader title="대시보드" description="오늘 기준 주문, 판매금액, 재고 부족 흐름을 확인합니다." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
          </div>
        ))}
      </section>
      <section className="mt-4 grid gap-3 sm:mt-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">최근 7일 판매 흐름</h2>
            <StatusBadge tone="info">주문일 기준</StatusBadge>
          </div>
          <div className="mt-4 grid h-56 grid-cols-7 items-end gap-2 rounded-md bg-slate-50 px-3 py-4 sm:h-64 sm:gap-3 sm:px-4 sm:py-5">
            {dashboard.trend.map((item) => {
              const height = item.salesAmount === 0 ? 8 : Math.max((item.salesAmount / maxTrendSales) * 100, 12);

              return (
                <div key={item.label} className="flex h-full min-w-0 flex-col justify-end gap-2 text-center">
                  <div className="flex flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-blue-600/80"
                      style={{ height: `${height}%` }}
                      title={`${item.label} ${formatWon(item.salesAmount)}`}
                    />
                  </div>
                  <div>
                    <p className="truncate text-xs font-semibold text-slate-700">{item.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{formatNumber(item.orderCount)}건</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">최근 주문</h2>
            <Link href={routes.orders} className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              전체 보기
            </Link>
          </div>
          <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
            {dashboard.recentOrders.length === 0 ? (
              <p className="rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                아직 등록된 주문이 없습니다.
              </p>
            ) : (
              dashboard.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={routes.orderDetail(order.id)}
                  className="rounded-md border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-950">{order.customer_name}</p>
                    <StatusBadge tone="info">{formatWon(order.total_amount)}</StatusBadge>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{order.itemSummary}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
