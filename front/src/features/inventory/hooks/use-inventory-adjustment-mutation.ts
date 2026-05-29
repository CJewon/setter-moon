"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryAdjustmentValues } from "@/features/inventory/schemas/inventory-adjustment-schema";
import { requestJson } from "@/shared/api/http";

type InventoryAdjustmentData = {
  afterStock: number;
  beforeStock: number;
  productId: string;
  variantId: string;
};

export function useInventoryAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InventoryAdjustmentValues) =>
      requestJson<InventoryAdjustmentData>("/api/inventory/adjustments", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["product", data.productId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}
