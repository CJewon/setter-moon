"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductCreateValues } from "@/features/products/schemas/product-form-schema";
import { requestJson } from "@/shared/api/http";

type CreateProductData = {
  productId: string;
};

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProductCreateValues) =>
      requestJson<CreateProductData>("/api/products", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", data.productId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["usage-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}
