"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  OrderBulkStatusUpdateValues,
  OrderEditValues,
  OrderFormValues,
  OrderStatusUpdateValues
} from "@/features/orders/schemas/order-form-schema";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";

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
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderFormValues) =>
      requestJson<CreateOrderData>("/api/orders", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.order(data.orderId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.usageSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}

export function useUpdateOrderStatusMutation(orderId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderStatusUpdateValues) =>
      requestJson<UpdateOrderStatusData>(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.order(data.orderId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLowStock }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryMovements }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}

export function useUpdateOrderMutation(orderId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderEditValues) =>
      requestJson<UpdateOrderData>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async ({ data }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.order(data.orderId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orderProductChoices }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLowStock }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}

export function useBulkUpdateOrderStatusMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OrderBulkStatusUpdateValues) =>
      requestJson<BulkUpdateOrderStatusData>("/api/orders/bulk-status", {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orderBase }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLowStock }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryMovements }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}
