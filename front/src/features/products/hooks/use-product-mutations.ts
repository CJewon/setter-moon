"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductCreateValues } from "@/features/products/schemas/product-form-schema";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";

type CreateProductData = {
  productId: string;
};

export function useCreateProductMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProductCreateValues) =>
      requestJson<CreateProductData>("/api/products", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.product(data.productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usageSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}
