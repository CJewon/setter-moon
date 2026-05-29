"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useUpdateProductMutation } from "@/features/products/hooks/use-product-update-mutation";
import { productEditSchema, type ProductEditValues } from "@/features/products/schemas/product-edit-schema";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { routes } from "@/shared/constants/routes";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { cn } from "@/shared/utils/cn";

type ProductEditFormProps = {
  product: ProductEditValues & {
    id: string;
  };
};

type ProductEditFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  status: "error" | "idle" | "success";
};

const initialState: ProductEditFormState = {
  message: "",
  status: "idle"
};

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const updateProductMutation = useUpdateProductMutation(product.id);
  const [state, setState] = useState<ProductEditFormState>(initialState);
  const pending = updateProductMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = productEditSchema.safeParse({
      basePrice: formData.get("basePrice"),
      memo: formData.get("memo"),
      name: formData.get("name"),
      status: formData.get("status")
    });

    if (!parsed.success) {
      const nextState = {
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "상품 정보를 다시 확인해 주세요.",
        status: "error" as const
      };

      setState(nextState);
      showToast({ message: nextState.message, title: "확인 필요", tone: "error" });
      return;
    }

    setState(initialState);
    updateProductMutation.mutate(parsed.data, {
      onError: (error) => {
        const nextState = getApiErrorState(error, "상품 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");

        setState(nextState);
        showToast({ message: nextState.message, title: "저장 실패", tone: "error" });
      },
      onSuccess: ({ data, message }) => {
        setState({ message, status: "success" });
        showToast({ message, title: "저장 완료", tone: "success" });
        router.push(routes.productDetail(data.productId) as Route);
        router.refresh();
      }
    });
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_320px]" onSubmit={handleSubmit} noValidate>
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">상품 기본 정보</h2>
          <p className="mt-1 text-sm text-slate-500">목록과 상세 화면에 표시되는 핵심 정보를 수정합니다.</p>
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
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-name">
            상품명
            <input
              id="product-name"
              name="name"
              className={cn(
                "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                state.fieldErrors?.name?.[0] && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
              defaultValue={product.name}
              maxLength={80}
              required
            />
            {state.fieldErrors?.name?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.name[0]}</span> : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-base-price">
            기본 판매가
            <input
              id="product-base-price"
              name="basePrice"
              className={cn(
                "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                state.fieldErrors?.basePrice?.[0] && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
              defaultValue={product.basePrice}
              inputMode="numeric"
              min={0}
              type="number"
              required
            />
            {state.fieldErrors?.basePrice?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.basePrice[0]}</span> : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-status">
            판매상태
            <select
              id="product-status"
              name="status"
              className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              defaultValue={product.status}
            >
              <option value="active">{productStatusLabel.active}</option>
              <option value="sold_out">{productStatusLabel.sold_out}</option>
              <option value="hidden">{productStatusLabel.hidden}</option>
            </select>
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-memo">
          상품 메모
          <textarea
            id="product-memo"
            name="memo"
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            defaultValue={product.memo ?? ""}
            maxLength={500}
            placeholder="내부 확인용 메모를 적어둘 수 있습니다."
          />
          {state.fieldErrors?.memo?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.memo[0]}</span> : null}
        </label>
      </section>

      <aside className="grid h-fit gap-4">
        <section className="rounded-md border border-blue-100 bg-blue-50/70 p-5">
          <p className="text-xs font-semibold text-blue-700">수정 범위 안내</p>
          <h2 className="mt-2 text-base font-semibold text-slate-950">옵션과 재고는 이력과 함께 관리해요</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            이 화면에서는 상품명, 기본 판매가, 판매 상태, 메모를 수정합니다. 옵션별 재고는 주문과 재고 이력에 연결되어
            있어 재고 조정 화면에서 따로 관리합니다.
          </p>
          <div className="mt-4 grid gap-2">
            <Link
              href={routes.productDetail(product.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              상품 상세에서 옵션 확인
            </Link>
            <Link
              href={routes.inventory}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              재고 목록에서 조정
            </Link>
            <Link
              href={routes.newProduct}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              새 상품으로 등록
            </Link>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">저장 전 확인</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            판매 상태를 숨김으로 바꾸면 새 주문 등록 선택지에서 제외됩니다. 과거 주문과 재고 이력은 그대로 보존됩니다.
          </p>
          <div className="mt-5 grid gap-2">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={pending}
              type="submit"
            >
              {pending ? "저장 중" : "상품 정보 저장"}
            </button>
            <Link
              href={routes.productDetail(product.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              취소
            </Link>
          </div>
        </section>
      </aside>
    </form>
  );
}
