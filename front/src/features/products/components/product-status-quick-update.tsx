"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateProductMutation } from "@/features/products/hooks/use-product-update-mutation";
import type { ProductEditValues } from "@/features/products/schemas/product-edit-schema";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";
import { useToast } from "@/shared/components/toast-provider";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { getApiErrorState } from "@/shared/api/http";

type ProductStatusQuickUpdateProps = {
  product: ProductEditValues & {
    id: string;
  };
};

const productStatuses: ProductEditValues["status"][] = ["active", "sold_out", "hidden"];

export function ProductStatusQuickUpdate({ product }: ProductStatusQuickUpdateProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const updateProductMutation = useUpdateProductMutation(product.id);
  const [status, setStatus] = useState<ProductEditValues["status"]>(product.status);
  const isUnchanged = status === product.status;

  function submitStatus(nextStatus: ProductEditValues["status"]) {
    updateProductMutation.mutate(
      {
        ...product,
        status: nextStatus
      },
      {
        onError: (error) => {
          const nextState = getApiErrorState(error, "판매상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          showToast({ message: nextState.message, title: "변경 실패", tone: "error" });
        },
        onSuccess: ({ message }) => {
          showToast({ message, title: "변경 완료", tone: "success" });
          router.refresh();
        }
      }
    );
  }

  function handleSubmit() {
    submitStatus(status);
  }

  function handleHideProduct() {
    const confirmed = window.confirm("상품을 숨김 처리할까요? 숨김 상품은 주문 등록 선택지에서 제외되고, 상품 목록의 숨김 필터에서 다시 확인할 수 있습니다.");

    if (!confirmed) {
      return;
    }

    setStatus("hidden");
    submitStatus("hidden");
  }

  function handleReactivateProduct() {
    setStatus("active");
    submitStatus("active");
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm font-semibold text-slate-800" htmlFor="product-status-quick-update">
        판매상태
        <select
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          disabled={updateProductMutation.isPending}
          id="product-status-quick-update"
          onChange={(event) => setStatus(event.target.value as ProductEditValues["status"])}
          value={status}
        >
          {productStatuses.map((item) => (
            <option key={item} value={item}>
              {productStatusLabel[item]}
            </option>
          ))}
        </select>
      </label>
      <button
        className={primaryActionClassName}
        disabled={isUnchanged || updateProductMutation.isPending}
        onClick={handleSubmit}
        type="button"
      >
        {updateProductMutation.isPending ? "변경 중" : "판매상태 변경"}
      </button>
      {product.status === "hidden" ? (
        <button
          className={secondaryActionClassName}
          disabled={updateProductMutation.isPending}
          onClick={handleReactivateProduct}
          type="button"
        >
          판매중으로 복구
        </button>
      ) : (
        <button
          className={secondaryActionClassName}
          disabled={updateProductMutation.isPending}
          onClick={handleHideProduct}
          type="button"
        >
          상품 숨김 처리
        </button>
      )}
    </div>
  );
}
