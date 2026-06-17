"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductDetail, ProductListItem } from "@/server/products/types";
import type { ProductStatus } from "@/shared/types/domain";
import type { PaginatedResult } from "@/shared/types/pagination";
import { buildQueryString } from "@/shared/api/build-query-string";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";

export type ProductListQuery = {
  keyword?: string;
  page?: number | string;
  pageSize?: number | string;
  status?: ProductStatus;
};

export type ProductListResponse = PaginatedResult<ProductListItem>;

export function useProductsQuery(query: ProductListQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: async () => (await requestJson<ProductListResponse>(`/api/products${buildQueryString(query)}`)).data
  });
}

export function useProductQuery(productId: string) {
  return useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: async () => (await requestJson<ProductDetail>(`/api/products/${productId}`)).data,
    enabled: Boolean(productId)
  });
}
