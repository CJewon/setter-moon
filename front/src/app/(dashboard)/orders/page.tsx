import Link from "next/link";
import type { Route } from "next";
import type { OrderStatus } from "@/server/orders/types";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { listOrdersForStore } from "@/server/orders/service";
import { requireDashboardAccess } from "@/server/auth/session";
import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";
import { orderStatusLabel } from "@/shared/constants/status-labels";
import { formatNumber, formatWon } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

const orderTabs: Array<{ href: string; label: string; status?: OrderStatus }> = [
  { href: "/orders", label: "전체" },
  { href: "/orders?status=received", label: orderStatusLabel.received, status: "received" },
  { href: "/orders?status=ready_to_ship", label: orderStatusLabel.ready_to_ship, status: "ready_to_ship" },
  { href: "/orders?status=shipping", label: orderStatusLabel.shipping, status: "shipping" },
  { href: "/orders?status=delivered", label: orderStatusLabel.delivered, status: "delivered" },
  { href: "/orders?status=cancelled", label: orderStatusLabel.cancelled, status: "cancelled" },
  { href: "/orders?status=hold", label: orderStatusLabel.hold, status: "hold" }
];

type OrdersPageProps = {
  searchParams: Promise<{
    status?: OrderStatus;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const { status } = await searchParams;
  const selectedStatus = orderTabs.some((tab) => tab.status === status) ? status : undefined;
  const orders = await listOrdersForStore(supabase, access.store.id, selectedStatus);

  return (
    <>
      <PageHeader
        title="주문"
        description="수동 등록한 주문과 배송 상태를 관리합니다."
        action={{ href: routes.newOrder, label: "주문 등록" }}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {orderTabs.map((tab) => {
          const active = tab.status === selectedStatus || (!tab.status && !selectedStatus);

          return (
            <Link
              key={tab.label}
              href={tab.href as Route}
              className={
                active
                  ? "min-h-9 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                  : "min-h-9 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="app-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>고객명</th>
              <th>상품/옵션</th>
              <th>수량</th>
              <th>주문금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-sm text-slate-500">
                  아직 등록한 주문이 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/orders/${order.id}`} className="font-semibold text-slate-950 hover:text-blue-700">
                      {order.order_no}
                    </Link>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.itemSummary}</td>
                  <td>{formatNumber(order.totalQuantity)}개</td>
                  <td>{formatWon(order.total_amount)}</td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
