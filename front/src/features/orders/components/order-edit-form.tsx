"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useUpdateOrderMutation } from "@/features/orders/hooks/use-order-mutations";
import { orderEditSchema, type OrderEditValues } from "@/features/orders/schemas/order-form-schema";
import type { OrderStatus } from "@/server/orders/types";
import { getApiErrorState } from "@/shared/api/http";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";
import { useToast } from "@/shared/components/toast-provider";
import { orderStatusLabel } from "@/shared/constants/status-labels";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";

type OrderEditFormProps = {
  order: OrderEditValues & {
    id: string;
    orderNo: string;
    status: OrderStatus;
  };
};

type OrderEditFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  status: "error" | "idle" | "success";
};

const initialState: OrderEditFormState = {
  message: "",
  status: "idle"
};

function getLocalDateTimeValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return offsetDate.toISOString().slice(0, 16);
}

export function OrderEditForm({ order }: OrderEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const updateOrderMutation = useUpdateOrderMutation(order.id);
  const [state, setState] = useState<OrderEditFormState>(initialState);
  const pending = updateOrderMutation.isPending;
  const isEditableStatus = order.status === "received" || order.status === "hold";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = orderEditSchema.safeParse({
      customerName: formData.get("customerName"),
      customerPhone: formData.get("customerPhone"),
      memo: formData.get("memo"),
      orderedAt: formData.get("orderedAt")
    });

    if (!parsed.success) {
      const nextState = {
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "주문 정보를 다시 확인해 주세요.",
        status: "error" as const
      };

      setState(nextState);
      showToast({ message: nextState.message, title: "확인 필요", tone: "error" });
      return;
    }

    setState(initialState);
    updateOrderMutation.mutate(parsed.data, {
      onError: (error) => {
        const nextState = getApiErrorState(error, "주문 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");

        setState(nextState);
        showToast({ message: nextState.message, title: "저장 실패", tone: "error" });
      },
      onSuccess: ({ data, message }) => {
        setState({ message, status: "success" });
        showToast({ message, title: "저장 완료", tone: "success" });
        router.push(routes.orderDetail(data.orderId) as Route);
        router.refresh();
      }
    });
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_320px]" onSubmit={handleSubmit} noValidate>
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">주문 기본 정보</h2>
          <p className="mt-1 text-sm text-slate-500">고객 정보와 주문일, 내부 메모만 수정합니다.</p>
        </div>

        {state.message ? (
          <p
            className={cn(
              "mt-5 rounded-md px-4 py-3 text-sm font-medium",
              state.status === "success" ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-700"
            )}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="order-customer-name">
            고객명
            <input
              className={cn(
                "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                state.fieldErrors?.customerName?.[0] && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
              defaultValue={order.customerName}
              disabled={!isEditableStatus || pending}
              id="order-customer-name"
              maxLength={40}
              name="customerName"
              required
            />
            {state.fieldErrors?.customerName?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.customerName[0]}</span> : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="order-customer-phone">
            연락처
            <input
              className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
              defaultValue={order.customerPhone ?? ""}
              disabled={!isEditableStatus || pending}
              id="order-customer-phone"
              maxLength={30}
              name="customerPhone"
              placeholder="예: 010-0000-0000"
            />
            {state.fieldErrors?.customerPhone?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.customerPhone[0]}</span> : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="order-ordered-at">
            주문일
            <input
              className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
              defaultValue={getLocalDateTimeValue(order.orderedAt)}
              disabled={!isEditableStatus || pending}
              id="order-ordered-at"
              name="orderedAt"
              type="datetime-local"
            />
            {state.fieldErrors?.orderedAt?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.orderedAt[0]}</span> : null}
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800" htmlFor="order-memo">
          메모
          <textarea
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
            defaultValue={order.memo ?? ""}
            disabled={!isEditableStatus || pending}
            id="order-memo"
            maxLength={500}
            name="memo"
            placeholder="배송 전 확인할 내용을 남겨둘 수 있습니다."
          />
          {state.fieldErrors?.memo?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.memo[0]}</span> : null}
        </label>
      </section>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">수정 전 확인</h2>
        <dl className="mt-3 grid gap-3 text-sm">
          <div>
            <dt className="text-slate-500">주문번호</dt>
            <dd className="mt-1 font-semibold text-slate-950">{order.orderNo}</dd>
          </div>
          <div>
            <dt className="text-slate-500">현재 상태</dt>
            <dd className="mt-1 font-semibold text-slate-950">{orderStatusLabel[order.status]}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          상품, 옵션 조합, 수량은 이 화면에서 바꾸지 않습니다. 재고에 영향을 주는 변경은 별도 흐름에서 다룹니다.
        </p>
        {!isEditableStatus ? (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            주문접수 또는 보류 상태에서만 주문 정보를 수정할 수 있습니다.
          </p>
        ) : null}
        <div className="mt-5 grid gap-2">
          <button className={primaryActionClassName} disabled={!isEditableStatus || pending} type="submit">
            {pending ? "저장 중" : "주문 정보 저장"}
          </button>
          <Link href={routes.orderDetail(order.id)} className={secondaryActionClassName}>
            취소
          </Link>
        </div>
      </aside>
    </form>
  );
}
