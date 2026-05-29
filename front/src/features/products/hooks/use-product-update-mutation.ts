"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductEditValues } from "@/features/products/schemas/product-edit-schema";
import { requestJson } from "@/shared/api/http";

type UpdateProductData = {
  productId: string;
};

export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProductEditValues) =>
      requestJson<UpdateProductData>(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", data.productId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}
