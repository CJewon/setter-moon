import { notFound } from "next/navigation";
import { OrderStatusActions } from "@/features/orders/components/order-status-actions";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getOrderDetailForStore, isOrderNotFoundError } from "@/server/orders/service";
import { requireDashboardAccess } from "@/server/auth/session";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { routes } from "@/shared/constants/routes";
import { orderStatusLabel } from "@/shared/constants/status-labels";
import { formatNumber, formatWon } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const { orderId } = await params;
  let order;

  try {
    order = await getOrderDetailForStore(supabase, access.store.id, orderId);
  } catch (error) {
    if (isOrderNotFoundError(error)) {
      notFound();
    }

    throw error;
  }

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.orders,
          label: "주문 목록으로"
        }}
      />
      <section className="grid gap-3 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-3">
          <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">주문 정보</h2>
                <p className="mt-1 text-sm text-slate-500">주문번호 {order.order_no}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{order.customer_name}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-slate-500">연락처</dt>
                <dd className="mt-1 font-medium text-slate-950">{order.customer_phone || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">주문금액</dt>
                <dd className="mt-1 font-medium text-slate-950">{formatWon(order.total_amount)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">주문일</dt>
                <dd className="mt-1 font-medium text-slate-950">{new Date(order.ordered_at).toLocaleString("ko-KR")}</dd>
              </div>
            </dl>
            {order.memo ? <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{order.memo}</p> : null}
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-semibold text-slate-950">주문 상품</h2>
            <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 sm:mt-5">
              <table className="app-table responsive-card-table">
                <thead>
                  <tr>
                    <th>상품</th>
                    <th>옵션 조합</th>
                    <th>수량</th>
                    <th>판매가</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="상품">{item.product_name_snapshot}</td>
                      <td data-label="옵션 조합">{item.variant_name_snapshot}</td>
                      <td data-label="수량">{formatNumber(item.quantity)}개</td>
                      <td data-label="판매가">{formatWon(item.unit_price)}</td>
                      <td data-label="금액">{formatWon(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-semibold text-slate-950">상태 변경 이력</h2>
            <div className="mt-4 grid gap-3">
              {order.statusLogs.length === 0 ? (
                <p className="text-sm text-slate-500">아직 상태 변경 이력이 없습니다.</p>
              ) : (
                order.statusLogs.map((log) => (
                  <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-950">
                      {log.from_status ? orderStatusLabel[log.from_status] : "시작"} → {orderStatusLabel[log.to_status]}
                    </p>
                    <p className="mt-1 text-slate-500">{new Date(log.created_at).toLocaleString("ko-KR")}</p>
                    {log.memo ? <p className="mt-2 text-slate-600">{log.memo}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">상태 변경</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            배송대기로 변경하면 현재 재고를 확인한 뒤 실제 재고를 차감합니다.
          </p>
          <div className="mt-5">
            <OrderStatusActions orderId={order.id} status={order.status} />
          </div>
        </aside>
      </section>
    </>
  );
}
