"use client";

import { useMutation } from "@tanstack/react-query";
import type { ProductEditValues } from "@/features/products/schemas/product-edit-schema";
import { requestJson } from "@/shared/api/http";

type UpdateProductData = {
  productId: string;
};

export function useUpdateProductMutation(productId: string) {
  return useMutation({
    mutationFn: (values: ProductEditValues) =>
      requestJson<UpdateProductData>(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      })
  });
}
