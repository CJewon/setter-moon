"use client";

import { useMutation } from "@tanstack/react-query";
import type { InventoryAdjustmentValues } from "@/features/inventory/schemas/inventory-adjustment-schema";
import { requestJson } from "@/shared/api/http";

type InventoryAdjustmentData = {
  afterStock: number;
  beforeStock: number;
  productId: string;
  variantId: string;
};

export function useInventoryAdjustmentMutation() {
  return useMutation({
    mutationFn: (values: InventoryAdjustmentValues) =>
      requestJson<InventoryAdjustmentData>("/api/inventory/adjustments", {
        method: "POST",
        body: JSON.stringify(values)
      })
  });
}
