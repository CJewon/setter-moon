"use client";

import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/server/orders/types";
import { useUpdateOrderStatusMutation } from "@/features/orders/hooks/use-order-mutations";
import type { OrderStatusUpdateValues } from "@/features/orders/schemas/order-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";

type OrderStatusActionsProps = {
  orderId: string;
  status: OrderStatus;
};

export function OrderStatusActions({ orderId, status }: OrderStatusActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const mutation = useUpdateOrderStatusMutation(orderId);

  function submitStatusChange(values: OrderStatusUpdateValues, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    mutation.mutate(values, {
      onError: (error) => {
        const nextState = getApiErrorState(error, "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");

        showToast({ message: nextState.message, title: "변경 실패", tone: "error" });
      },
      onSuccess: ({ message }) => {
        showToast({ message, title: "변경 완료", tone: "success" });
        router.refresh();
      }
    });
  }

  if (status === "cancelled" || status === "delivered") {
    return <p className="text-sm text-slate-500">더 이상 변경할 상태가 없습니다.</p>;
  }

  return (
    <div className="grid gap-2">
      {status === "received" ? (
        <>
          <button
            className="min-h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            disabled={mutation.isPending}
            type="button"
            onClick={() =>
              submitStatusChange(
                { toStatus: "ready_to_ship" },
                "배송대기로 변경하면 해당 옵션별 재고가 차감됩니다. 진행할까요?"
              )
            }
          >
            배송대기로 변경
          </button>
          <button
            className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
            disabled={mutation.isPending}
            type="button"
            onClick={() =>
              submitStatusChange(
                { holdReservationPolicy: "keep", toStatus: "hold" },
                "보류 처리하면서 주문접수 예약 수량은 유지합니다. 진행할까요?"
              )
            }
          >
            보류 처리
          </button>
          <button
            className="min-h-10 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:text-slate-400"
            disabled={mutation.isPending}
            type="button"
            onClick={() => submitStatusChange({ toStatus: "cancelled" }, "주문을 취소할까요? 주문접수 상태라 복구할 재고는 없습니다.")}
          >
            취소 처리
          </button>
        </>
      ) : null}
      {status === "ready_to_ship" ? (
        <>
          <button
            className="min-h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            disabled={mutation.isPending}
            type="button"
            onClick={() => submitStatusChange({ toStatus: "shipping" })}
          >
            배송중으로 변경
          </button>
          <button
            className="min-h-10 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:text-slate-400"
            disabled={mutation.isPending}
            type="button"
            onClick={() =>
              submitStatusChange(
                { restoreStock: true, toStatus: "cancelled" },
                "이 주문은 배송대기 상태에서 재고가 차감되었습니다. 취소 처리하며 재고를 복구할까요?"
              )
            }
          >
            취소하고 재고 복구
          </button>
          <button
            className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
            disabled={mutation.isPending}
            type="button"
            onClick={() => submitStatusChange({ restoreStock: false, toStatus: "cancelled" }, "재고 복구 없이 주문만 취소할까요?")}
          >
            재고 복구 없이 취소
          </button>
        </>
      ) : null}
      {status === "shipping" ? (
        <button
          className="min-h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
          disabled={mutation.isPending}
          type="button"
          onClick={() => submitStatusChange({ toStatus: "delivered" })}
        >
          배송완료로 변경
        </button>
      ) : null}
    </div>
  );
}
