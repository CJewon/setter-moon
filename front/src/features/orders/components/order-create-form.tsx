"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { OrderProductChoice, OrderVariantChoice } from "@/server/orders/types";
import { useCreateOrderMutation } from "@/features/orders/hooks/use-order-mutations";
import { orderFormSchema } from "@/features/orders/schemas/order-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { formatNumber, formatWon } from "@/shared/lib/format";
import { cn } from "@/shared/utils/cn";

type OrderCreateFormProps = {
  products: OrderProductChoice[];
};

type OrderCreateFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  status: "error" | "idle";
};

const initialState: OrderCreateFormState = {
  message: "",
  status: "idle"
};

function getVariantList(products: OrderProductChoice[]) {
  return products.flatMap((product) => product.variants);
}

function findVariant(variants: OrderVariantChoice[], variantId: string) {
  return variants.find((variant) => variant.variantId === variantId);
}

export function OrderCreateForm({ products }: OrderCreateFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const createOrderMutation = useCreateOrderMutation();
  const variants = useMemo(() => getVariantList(products), [products]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [orderedAt, setOrderedAt] = useState("");
  const [productId, setProductId] = useState("");
  const product = products.find((item) => item.id === productId);
  const [variantId, setVariantId] = useState("");
  const selectedVariant = findVariant(variants, variantId);
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [state, setState] = useState<OrderCreateFormState>(initialState);
  const quantityValue = Number(quantity || 0);
  const unitPriceValue = Number(unitPrice || selectedVariant?.price || 0);
  const totalAmount = Math.max(quantityValue, 0) * Math.max(unitPriceValue, 0);
  const selectedProductVariants = product?.variants ?? [];
  const quantityExceedsAvailableStock = Boolean(selectedVariant && quantityValue > selectedVariant.availableStock);
  const itemError = state.fieldErrors?.items?.[0];

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

    const payload = {
      customerName,
      customerPhone,
      items: [
        {
          quantity,
          unitPrice: unitPrice || selectedVariant?.price || 0,
          variantId
        }
      ],
      memo,
      orderedAt
    };
    const parsed = orderFormSchema.safeParse(payload);

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
    createOrderMutation.mutate(parsed.data, {
      onError: (error) => {
        const nextState = getApiErrorState(error, "주문을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");

        setState(nextState);
        showToast({ message: nextState.message, title: "등록 실패", tone: "error" });
      },
      onSuccess: ({ data, message }) => {
        showToast({ message, title: "등록 완료", tone: "success" });
        router.push(`/orders/${data.orderId}`);
      }
    });
  }

  if (products.length === 0) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">주문할 상품이 없습니다</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">주문 등록 전에 상품과 옵션별 재고를 먼저 등록해 주세요.</p>
      </section>
    );
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_320px]" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5">
        {state.status === "error" && state.message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.message}
          </div>
        ) : null}

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">주문 기본 정보</h2>
            <p className="mt-1 text-sm text-slate-500">고객명과 연락처를 입력합니다.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="customer-name">
              고객명
              <input
                id="customer-name"
                className={cn(
                  "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  state.fieldErrors?.customerName?.[0] && "border-red-300 focus:border-red-500 focus:ring-red-100"
                )}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                maxLength={40}
                placeholder="예: 김셀러"
              />
              {state.fieldErrors?.customerName?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.customerName[0]}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="customer-phone">
              연락처
              <input
                id="customer-phone"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                maxLength={30}
                placeholder="선택 입력"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="ordered-at">
              주문일
              <input
                id="ordered-at"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                type="datetime-local"
                value={orderedAt}
                onChange={(event) => setOrderedAt(event.target.value)}
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800" htmlFor="order-memo">
            주문 메모
            <textarea
              id="order-memo"
              className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              maxLength={500}
              placeholder="판매 채널, 요청사항, 배송 메모 등을 적어둘 수 있습니다."
            />
          </label>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">주문 상품</h2>
            <p className="mt-1 text-sm text-slate-500">상품과 옵션 조합을 선택한 뒤 수량을 입력합니다.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-select">
              상품
              <select
                id="product-select"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={productId}
                onChange={(event) => handleProductChange(event.target.value)}
              >
                <option value="">상품을 선택해 주세요</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="variant-select">
              옵션 조합
              <select
                id="variant-select"
                className={cn(
                  "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50",
                  itemError && "border-red-300 focus:border-red-500 focus:ring-red-100"
                )}
                disabled={!productId}
                value={variantId}
                onChange={(event) => handleVariantChange(event.target.value)}
              >
                <option value="">{productId ? "옵션 조합을 선택해 주세요" : "먼저 상품을 선택해 주세요"}</option>
                {selectedProductVariants.map((variant) => (
                  <option key={variant.variantId} value={variant.variantId}>
                    {variant.variantName} · 가용 {formatNumber(variant.availableStock)}개
                  </option>
                ))}
              </select>
              {itemError ? <span className="text-xs text-red-700">{itemError}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="order-quantity">
              수량
              <input
                id="order-quantity"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                inputMode="numeric"
                min={1}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="unit-price">
              판매가
              <input
                id="unit-price"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              가용 재고가 부족합니다. 그래도 주문접수로 등록할 수 있습니다.
            </p>
          ) : null}
        </section>

        <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">등록하면 주문접수 상태로 저장됩니다. 실제 재고는 배송대기로 바꿀 때 차감됩니다.</p>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={createOrderMutation.isPending}
            type="submit"
          >
            {createOrderMutation.isPending ? "등록 중" : "주문 등록"}
          </button>
        </div>
      </div>

      <aside className="h-fit rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">주문 요약</h2>
        <dl className="mt-5 grid gap-4 text-sm">
          <div>
            <dt className="text-slate-500">상태</dt>
            <dd className="mt-1 font-semibold text-slate-950">주문접수</dd>
          </div>
          <div>
            <dt className="text-slate-500">상품</dt>
            <dd className="mt-1 font-semibold text-slate-950">{product?.name ?? "선택 전"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">선택한 옵션</dt>
            <dd className="mt-1 font-semibold text-slate-950">{selectedVariant?.variantName ?? "선택 전"}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3 text-center">
            <div>
              <dt className="text-xs text-slate-500">현재</dt>
              <dd className="mt-1 font-bold text-slate-950">{formatNumber(selectedVariant?.currentStock ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">주문접수</dt>
              <dd className="mt-1 font-bold text-slate-950">{formatNumber(selectedVariant?.reservedQuantity ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">가용</dt>
              <dd className={cn("mt-1 font-bold", quantityExceedsAvailableStock ? "text-amber-700" : "text-slate-950")}>
                {formatNumber(selectedVariant?.availableStock ?? 0)}
              </dd>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <dt className="text-slate-500">주문금액</dt>
            <dd className="mt-1 text-xl font-bold text-slate-950">{formatWon(totalAmount)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
