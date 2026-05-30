"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useUpdateOrderMutation } from "@/features/orders/hooks/use-order-mutations";
import { orderEditSchema, type OrderEditValues } from "@/features/orders/schemas/order-form-schema";
import type { OrderDetail, OrderProductChoice, OrderStatus, OrderVariantChoice } from "@/server/orders/types";
import { getApiErrorState } from "@/shared/api/http";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";
import { useToast } from "@/shared/components/toast-provider";
import { orderStatusLabel } from "@/shared/constants/status-labels";
import { routes } from "@/shared/constants/routes";
import { formatNumber, formatWon } from "@/shared/lib/format";
import { cn } from "@/shared/utils/cn";

type OrderEditFormProps = {
  order: Omit<OrderEditValues, "items"> & {
    id: string;
    items: OrderDetail["items"];
    orderNo: string;
    status: OrderStatus;
  };
  products: OrderProductChoice[];
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

function getVariantList(products: OrderProductChoice[]) {
  return products.flatMap((product) => product.variants);
}

function findVariant(variants: OrderVariantChoice[], variantId: string) {
  return variants.find((variant) => variant.variantId === variantId);
}

export function OrderEditForm({ order, products }: OrderEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const updateOrderMutation = useUpdateOrderMutation(order.id);
  const firstItem = order.items[0];
  const variants = useMemo(() => getVariantList(products), [products]);
  const [state, setState] = useState<OrderEditFormState>(initialState);
  const [productId, setProductId] = useState(firstItem?.product_id ?? "");
  const [variantId, setVariantId] = useState(firstItem?.variant_id ?? "");
  const [quantity, setQuantity] = useState(firstItem ? String(firstItem.quantity) : "1");
  const [unitPrice, setUnitPrice] = useState(firstItem ? String(firstItem.unit_price) : "");
  const pending = updateOrderMutation.isPending;
  const canEditBasic = order.status === "received" || order.status === "hold";
  const canEditItems = order.status === "received" && order.items.length === 1;
  const product = products.find((item) => item.id === productId);
  const selectedProductVariants = product?.variants ?? [];
  const selectedVariant = findVariant(variants, variantId);
  const itemError = state.fieldErrors?.items?.[0];
  const quantityValue = Number(quantity || 0);
  const unitPriceValue = Number(unitPrice || selectedVariant?.price || 0);
  const totalAmount = Math.max(quantityValue, 0) * Math.max(unitPriceValue, 0);
  const currentProductIsMissing = Boolean(productId && !products.some((item) => item.id === productId));
  const currentVariantIsMissing = Boolean(variantId && !variants.some((variant) => variant.variantId === variantId));
  const quantityExceedsAvailableStock = Boolean(selectedVariant && quantityValue > selectedVariant.availableStock);

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId);
    setVariantId("");
    setUnitPrice("");
  }

  function handleVariantChange(nextVariantId: string) {
    const nextVariant = findVariant(variants, nextVariantId);

    setVariantId(nextVariantId);
    setUnitPrice(nextVariant ? String(nextVariant.price) : "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = orderEditSchema.safeParse({
      customerName: formData.get("customerName"),
      customerPhone: formData.get("customerPhone"),
      items: canEditItems
        ? [
            {
              quantity,
              unitPrice: unitPrice || selectedVariant?.price || 0,
              variantId
            }
          ]
        : undefined,
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
      <div className="grid gap-5">
        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">주문 기본 정보</h2>
            <p className="mt-1 text-sm text-slate-500">고객명, 연락처, 주문일, 메모를 수정합니다.</p>
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
                  "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50",
                  state.fieldErrors?.customerName?.[0] && "border-red-300 focus:border-red-500 focus:ring-red-100"
                )}
                defaultValue={order.customerName}
                disabled={!canEditBasic || pending}
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
                disabled={!canEditBasic || pending}
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
                disabled={!canEditBasic || pending}
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
              disabled={!canEditBasic || pending}
              id="order-memo"
              maxLength={500}
              name="memo"
              placeholder="배송 전 확인할 내용을 적어둘 수 있습니다."
            />
            {state.fieldErrors?.memo?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.memo[0]}</span> : null}
          </label>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">주문 상품과 수량 수정</h2>
            <p className="mt-1 text-sm text-slate-500">
              {canEditItems
                ? "주문접수 상태라 상품, 옵션 조합, 수량을 다시 선택할 수 있습니다."
                : "주문 상품과 수량은 주문접수 상태에서만 수정할 수 있습니다."}
            </p>
          </div>

          {order.status === "received" && order.items.length !== 1 ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              현재 화면에서는 주문 상품 1개만 수정할 수 있습니다. 이 주문은 상세 화면에서 확인해 주세요.
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="edit-product-select">
              상품
              <select
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
                disabled={!canEditItems || pending}
                id="edit-product-select"
                value={productId}
                onChange={(event) => handleProductChange(event.target.value)}
              >
                <option value="">상품을 선택해 주세요</option>
                {currentProductIsMissing ? <option value={productId}>현재 상품은 새 주문 선택지에서 제외됨</option> : null}
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="edit-variant-select">
              옵션 조합
              <select
                className={cn(
                  "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50",
                  itemError && "border-red-300 focus:border-red-500 focus:ring-red-100"
                )}
                disabled={!canEditItems || !productId || pending}
                id="edit-variant-select"
                value={variantId}
                onChange={(event) => handleVariantChange(event.target.value)}
              >
                <option value="">{productId ? "옵션 조합을 선택해 주세요" : "먼저 상품을 선택해 주세요"}</option>
                {currentVariantIsMissing ? <option value={variantId}>현재 옵션은 새 주문 선택지에서 제외됨</option> : null}
                {selectedProductVariants.map((variant) => (
                  <option key={variant.variantId} value={variant.variantId}>
                    {variant.variantName} · 가용 {formatNumber(variant.availableStock)}개
                  </option>
                ))}
              </select>
              {itemError ? <span className="text-xs text-red-700">{itemError}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="edit-order-quantity">
              수량
              <input
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
                disabled={!canEditItems || pending}
                id="edit-order-quantity"
                inputMode="numeric"
                min={1}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="edit-unit-price">
              판매가
              <input
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
                disabled={!canEditItems || pending}
                id="edit-unit-price"
                inputMode="numeric"
                min={0}
                type="number"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                placeholder={selectedVariant ? String(selectedVariant.price) : "0"}
              />
            </label>
          </div>

          {selectedVariant ? (
            <div className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
              현재 {formatNumber(selectedVariant.currentStock)}개 · 주문접수 {formatNumber(selectedVariant.reservedQuantity)}개 · 가용{" "}
              {formatNumber(selectedVariant.availableStock)}개
            </div>
          ) : null}

          {quantityExceedsAvailableStock ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              가용 재고가 부족합니다. 주문접수 상태로는 저장할 수 있지만, 배송대기로 바꿀 때 재고가 다시 확인됩니다.
            </p>
          ) : null}
        </section>
      </div>

      <aside className="grid h-fit gap-4">
        <section className="rounded-md border border-blue-100 bg-blue-50/70 p-5">
          <p className="text-xs font-semibold text-blue-700">수정 범위</p>
          <h2 className="mt-2 text-base font-semibold text-slate-950">주문접수 상태에서만 상품과 수량을 바꿉니다</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            배송대기로 바뀐 주문은 이미 실제 재고가 차감되어 상품과 수량을 바꾸지 않습니다. 잘못 등록했다면 취소 후 새 주문으로 다시
            등록해 주세요.
          </p>
          <div className="mt-4 grid gap-2">
            <Link
              href={routes.orderDetail(order.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              주문 상세로 이동
            </Link>
            <Link
              href={routes.newOrder}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              새 주문으로 등록
            </Link>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">저장 전 확인</h2>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="text-slate-500">주문번호</dt>
              <dd className="mt-1 font-semibold text-slate-950">{order.orderNo}</dd>
            </div>
            <div>
              <dt className="text-slate-500">현재 상태</dt>
              <dd className="mt-1 font-semibold text-slate-950">{orderStatusLabel[order.status]}</dd>
            </div>
            <div>
              <dt className="text-slate-500">선택한 상품</dt>
              <dd className="mt-1 font-semibold text-slate-950">{product?.name ?? firstItem?.product_name_snapshot ?? "선택 전"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">선택한 옵션</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {selectedVariant?.variantName ?? firstItem?.variant_name_snapshot ?? "선택 전"}
              </dd>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <dt className="text-slate-500">주문금액</dt>
              <dd className="mt-1 text-xl font-bold text-slate-950">{formatWon(totalAmount)}</dd>
            </div>
          </dl>
          {!canEditBasic ? (
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              주문접수 또는 보류 상태에서만 주문 정보를 수정할 수 있습니다.
            </p>
          ) : null}
          <div className="mt-5 grid gap-2">
            <button className={primaryActionClassName} disabled={!canEditBasic || pending} type="submit">
              {pending ? "저장 중" : "주문 정보 저장"}
            </button>
            <Link href={routes.orderDetail(order.id)} className={secondaryActionClassName}>
              취소
            </Link>
          </div>
        </section>
      </aside>
    </form>
  );
}
