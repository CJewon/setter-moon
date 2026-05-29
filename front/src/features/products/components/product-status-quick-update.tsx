"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateProductMutation } from "@/features/products/hooks/use-product-update-mutation";
import type { ProductEditValues } from "@/features/products/schemas/product-edit-schema";
import { primaryActionClassName } from "@/shared/components/action-styles";
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

  function handleSubmit() {
    updateProductMutation.mutate(
      {
        ...product,
        status
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
    </div>
  );
}
