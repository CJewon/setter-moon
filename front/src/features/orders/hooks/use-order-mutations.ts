"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  OrderBulkStatusUpdateValues,
  OrderEditValues,
  OrderFormValues,
  OrderStatusUpdateValues
} from "@/features/orders/schemas/order-form-schema";
import { requestJson } from "@/shared/api/http";

type CreateOrderData = {
  orderId: string;
  orderNo: string;
  status: string;
};

type UpdateOrderStatusData = {
  orderId: string;
  status: string;
};

type UpdateOrderData = {
  orderId: string;
  status: string;
};

type BulkUpdateOrderStatusData = {
  failedCount: number;
  results: Array<{
    message?: string;
    orderId: string;
    status: "failed" | "updated";
  }>;
  updatedCount: number;
};

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderFormValues) =>
      requestJson<CreateOrderData>("/api/orders", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", data.orderId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["usage-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useUpdateOrderStatusMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderStatusUpdateValues) =>
      requestJson<UpdateOrderStatusData>(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", data.orderId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useUpdateOrderMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderEditValues) =>
      requestJson<UpdateOrderData>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", data.orderId] }),
        queryClient.invalidateQueries({ queryKey: ["order-product-choices"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useBulkUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderBulkStatusUpdateValues) =>
      requestJson<BulkUpdateOrderStatusData>("/api/orders/bulk-status", {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}
