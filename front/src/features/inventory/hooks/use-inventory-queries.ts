"use client";

import { useQuery } from "@tanstack/react-query";
import type { InventoryListItem, InventoryStatus, StockMovementListItem } from "@/server/inventory/service";
import type { PaginatedResult } from "@/shared/types/pagination";
import { buildQueryString } from "@/shared/api/build-query-string";
import { requestJson } from "@/shared/api/http";

export type InventoryListQuery = {
  keyword?: string;
  page?: number | string;
  pageSize?: number | string;
  status?: InventoryStatus;
};

export type InventoryPaginationQuery = {
  page?: number | string;
  pageSize?: number | string;
};

export type InventoryListResponse = PaginatedResult<InventoryListItem>;
export type StockMovementListResponse = PaginatedResult<StockMovementListItem>;

export function useInventoryQuery(query: InventoryListQuery) {
  return useQuery({
    queryKey: ["inventory", query],
    queryFn: async () => (await requestJson<InventoryListResponse>(`/api/inventory${buildQueryString(query)}`)).data
  });
}

export function useLowStockQuery(query: InventoryPaginationQuery) {
  return useQuery({
    queryKey: ["inventory-low-stock", query],
    queryFn: async () =>
      (await requestJson<InventoryListResponse>(`/api/inventory/low-stock${buildQueryString(query)}`)).data
  });
}

export function useStockMovementsQuery(query: InventoryPaginationQuery) {
  return useQuery({
    queryKey: ["inventory-movements", query],
    queryFn: async () =>
      (await requestJson<StockMovementListResponse>(`/api/inventory/movements${buildQueryString(query)}`)).data
  });
}
