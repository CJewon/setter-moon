"use client";

import Link from "next/link";
import { DashboardSalesChart } from "@/features/dashboard/components/dashboard-sales-chart";
import { useDashboardQuery } from "@/features/dashboard/hooks/use-dashboard-query";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";
import { StatusBadge } from "@/shared/components/status-badge";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { formatNumber, formatWon } from "@/shared/lib/format";

export function DashboardPageClient() {
  const dashboardQuery = useDashboardQuery();

  if (dashboardQuery.isLoading) {
    return <QueryLoadingState title="대시보드를 불러오고 있습니다." variant="dashboard" />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <QueryErrorState title="대시보드를 불러오지 못했습니다." />;
  }

  const dashboard = dashboardQuery.data;
  const summaryCards = [
    { label: "오늘 주문", value: formatNumber(dashboard.summary.todayOrders), helper: "주문일 기준" },
    { label: "오늘 판매금액", value: formatWon(dashboard.summary.todaySalesAmount), helper: "취소 주문 제외" },
    { label: "재고 부족 옵션", value: formatNumber(dashboard.summary.lowStockVariantCount), helper: "품절 포함" },
    { label: "배송대기", value: formatNumber(dashboard.summary.readyToShipOrders), helper: "재고 차감 완료" }
  ];

  return (
    <>
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
          <DashboardSalesChart data={dashboard.trend} />
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
              <div className="rounded-md bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-950">아직 등록된 주문이 없습니다.</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  상품을 먼저 등록하거나, 외부 채널에서 들어온 첫 주문을 직접 입력해 보세요.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <Link href={routes.newOrder} className={primaryActionClassName}>
                    주문 등록하기
                  </Link>
                  <Link href={routes.newProduct} className={secondaryActionClassName}>
                    상품 등록하기
                  </Link>
                </div>
              </div>
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
