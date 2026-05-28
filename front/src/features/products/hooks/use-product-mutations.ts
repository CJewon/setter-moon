"use client";

import { useMutation } from "@tanstack/react-query";
import type { ProductCreateValues } from "@/features/products/schemas/product-form-schema";
import { requestJson } from "@/shared/api/http";

type CreateProductData = {
  productId: string;
};

export function useCreateProductMutation() {
  return useMutation({
    mutationFn: (values: ProductCreateValues) =>
      requestJson<CreateProductData>("/api/products", {
        method: "POST",
        body: JSON.stringify(values)
      })
  });
}
