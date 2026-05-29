"use client";

import { useQuery } from "@tanstack/react-query";
import type { OrderDetail, OrderListItem, OrderProductChoice, OrderStatus } from "@/server/orders/types";
import type { OrderSort } from "@/server/orders/service";
import type { PaginatedResult } from "@/shared/types/pagination";
import { buildQueryString } from "@/shared/api/build-query-string";
import { requestJson } from "@/shared/api/http";

export type OrderListQuery = {
  customerKeyword?: string;
  fromDate?: string;
  keyword?: string;
  page?: number | string;
  pageSize?: number | string;
  productKeyword?: string;
  sort?: OrderSort;
  status?: OrderStatus;
  toDate?: string;
};

export type OrderListResponse = PaginatedResult<OrderListItem>;

export function useOrdersQuery(query: OrderListQuery) {
  return useQuery({
    queryKey: ["orders", query],
    queryFn: async () => (await requestJson<OrderListResponse>(`/api/orders${buildQueryString(query)}`)).data
  });
}

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => (await requestJson<OrderDetail>(`/api/orders/${orderId}`)).data,
    enabled: Boolean(orderId)
  });
}

export function useOrderProductChoicesQuery() {
  return useQuery({
    queryKey: ["order-product-choices"],
    queryFn: async () => (await requestJson<OrderProductChoice[]>("/api/orders/product-choices")).data
  });
}
