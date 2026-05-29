"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { OrderBulkStatusUpdateValues } from "@/features/orders/schemas/order-form-schema";
import type { OrderListItem } from "@/server/orders/types";
import type { OrderStatus } from "@/server/orders/types";
import { useBulkUpdateOrderStatusMutation } from "@/features/orders/hooks/use-order-mutations";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { routes } from "@/shared/constants/routes";
import { formatNumber, formatWon } from "@/shared/lib/format";

type OrderListTableProps = {
  items: OrderListItem[];
};

function isSameStatus(items: OrderListItem[], selectedIds: Set<string>, status: OrderStatus) {
  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  return selectedItems.length > 0 && selectedItems.every((item) => item.status === status);
}

function canCancel(items: OrderListItem[], selectedIds: Set<string>) {
  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  return selectedItems.length > 0 && selectedItems.every((item) => ["received", "ready_to_ship", "hold"].includes(item.status));
}

export function OrderListTable({ items }: OrderListTableProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const mutation = useBulkUpdateOrderStatusMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const visibleOrderIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const visibleSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((orderId) => visibleOrderIds.has(orderId))),
    [selectedIds, visibleOrderIds]
  );
  const selectedCount = visibleSelectedIds.size;
  const allSelected = items.length > 0 && items.every((item) => visibleSelectedIds.has(item.id));
  const selectedOrderIds = useMemo(() => [...visibleSelectedIds], [visibleSelectedIds]);
  const canMoveReadyToShip = isSameStatus(items, visibleSelectedIds, "received") || isSameStatus(items, visibleSelectedIds, "hold");
  const canMoveShipping = isSameStatus(items, visibleSelectedIds, "ready_to_ship");
  const canMoveDelivered = isSameStatus(items, visibleSelectedIds, "shipping");
  const canMoveHold = isSameStatus(items, visibleSelectedIds, "received");
  const canMoveCancelled = canCancel(items, visibleSelectedIds);

  function toggleOrder(orderId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }

      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) => {
      if (allSelected) {
        return new Set([...current].filter((orderId) => !visibleOrderIds.has(orderId)));
      }

      return new Set([...current, ...items.map((item) => item.id)]);
    });
  }

  function submitBulkStatus(
    toStatus: OrderBulkStatusUpdateValues["toStatus"],
    confirmMessage: string,
    options: { holdReservationPolicy?: "keep"; restoreStock?: boolean } = {}
  ) {
    if (selectedOrderIds.length === 0) {
      showToast({ message: "상태를 변경할 주문을 선택해 주세요.", title: "선택 필요", tone: "error" });
      return;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    mutation.mutate(
      {
        orderIds: selectedOrderIds,
        toStatus,
        ...options
      },
      {
        onError: (error) => {
          const nextState = getApiErrorState(error, "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");

          showToast({ message: nextState.message, title: "변경 실패", tone: "error" });
        },
        onSuccess: ({ data, message }) => {
          setSelectedIds(new Set(data.results.filter((result) => result.status === "failed").map((result) => result.orderId)));
          showToast({ message, title: data.failedCount > 0 ? "일부 변경" : "변경 완료", tone: data.failedCount > 0 ? "info" : "success" });
          router.refresh();
        }
      }
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">상태 변경</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {selectedCount > 0 ? `선택 ${formatNumber(selectedCount)}건` : "주문을 선택한 뒤 상태를 변경하세요."}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0">
          <button
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            disabled={!canMoveReadyToShip || mutation.isPending}
            type="button"
            onClick={() => submitBulkStatus("ready_to_ship", "선택한 주문을 배송대기 상태로 변경할까요? 재고가 차감됩니다.")}
          >
            배송대기
          </button>
          <button
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            disabled={!canMoveShipping || mutation.isPending}
            type="button"
            onClick={() => submitBulkStatus("shipping", "선택한 주문을 배송중 상태로 변경할까요?")}
          >
            배송중
          </button>
          <button
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            disabled={!canMoveDelivered || mutation.isPending}
            type="button"
            onClick={() => submitBulkStatus("delivered", "선택한 주문을 배송완료 상태로 변경할까요?")}
          >
            배송완료
          </button>
          <button
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
            disabled={!canMoveHold || mutation.isPending}
            type="button"
            onClick={() => submitBulkStatus("hold", "선택한 주문을 보류 상태로 변경할까요?", { holdReservationPolicy: "keep" })}
          >
            보류
          </button>
          <button
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:text-slate-400"
            disabled={!canMoveCancelled || mutation.isPending}
            type="button"
            onClick={() =>
              submitBulkStatus(
                "cancelled",
                "선택한 주문을 취소 상태로 변경할까요? 실제 환불, 교환, 반품 처리는 판매 채널에서 진행해 주세요.",
                { restoreStock: true }
              )
            }
          >
            취소
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="app-table responsive-card-table">
          <thead>
            <tr>
              <th>
                <input
                  aria-label="현재 페이지 주문 전체 선택"
                  checked={allSelected}
                  className="h-4 w-4 rounded border-slate-300"
                  onChange={toggleAll}
                  type="checkbox"
                />
              </th>
              <th>주문번호</th>
              <th>고객명</th>
              <th>상품/옵션</th>
              <th>수량</th>
              <th>주문금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-sm text-slate-500">
                  조건에 맞는 주문이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((order) => (
                <tr key={order.id}>
                  <td data-label="선택">
                    <input
                      aria-label={`${order.order_no} 선택`}
                      checked={selectedIds.has(order.id)}
                      className="h-4 w-4 rounded border-slate-300"
                      onChange={() => toggleOrder(order.id)}
                      type="checkbox"
                    />
                  </td>
                  <td data-label="주문번호">
                    <Link href={routes.orderDetail(order.id)} className="font-semibold text-slate-950 hover:text-blue-700">
                      {order.order_no}
                    </Link>
                  </td>
                  <td data-label="고객명">{order.customer_name}</td>
                  <td data-label="상품/옵션">{order.itemSummary}</td>
                  <td data-label="수량">{formatNumber(order.totalQuantity)}개</td>
                  <td data-label="주문금액">{formatWon(order.total_amount)}</td>
                  <td data-label="상태">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
