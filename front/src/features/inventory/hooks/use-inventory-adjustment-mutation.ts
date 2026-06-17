"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryAdjustmentValues } from "@/features/inventory/schemas/inventory-adjustment-schema";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";

type InventoryAdjustmentData = {
  afterStock: number;
  beforeStock: number;
  productId: string;
  variantId: string;
};

export function useInventoryAdjustmentMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InventoryAdjustmentValues) =>
      requestJson<InventoryAdjustmentData>("/api/inventory/adjustments", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLowStock }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryMovements }),
        queryClient.invalidateQueries({ queryKey: queryKeys.product(data.productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}
