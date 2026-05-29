"use client";

import { useMutation } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: (values: OrderFormValues) =>
      requestJson<CreateOrderData>("/api/orders", {
        method: "POST",
        body: JSON.stringify(values)
      })
  });
}

export function useUpdateOrderStatusMutation(orderId: string) {
  return useMutation({
    mutationFn: (values: OrderStatusUpdateValues) =>
      requestJson<UpdateOrderStatusData>(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(values)
      })
  });
}

export function useUpdateOrderMutation(orderId: string) {
  return useMutation({
    mutationFn: (values: OrderEditValues) =>
      requestJson<UpdateOrderData>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      })
  });
}

export function useBulkUpdateOrderStatusMutation() {
  return useMutation({
    mutationFn: (values: OrderBulkStatusUpdateValues) =>
      requestJson<BulkUpdateOrderStatusData>("/api/orders/bulk-status", {
        method: "PATCH",
        body: JSON.stringify(values)
      })
  });
}
