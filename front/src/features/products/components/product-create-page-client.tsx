"use client";

import type { UsageSummary } from "@/server/usage/usage-policy";
import { useQuery } from "@tanstack/react-query";
import { ProductCreateForm } from "@/features/products/components/product-create-form";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { requestJson } from "@/shared/api/http";

function useUsageSummaryQuery() {
  return useQuery({
    queryKey: ["usage-summary"],
    queryFn: async () => (await requestJson<UsageSummary>("/api/usage/summary")).data
  });
}

export function ProductCreatePageClient() {
  const usageSummaryQuery = useUsageSummaryQuery();

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.products,
          label: "상품 목록으로"
        }}
      />
      {usageSummaryQuery.isLoading ? <QueryLoadingState title="상품 등록 정보를 불러오고 있습니다." /> : null}
      {usageSummaryQuery.isError ? <QueryErrorState title="상품 등록 정보를 불러오지 못했습니다." /> : null}
      {usageSummaryQuery.data ? <ProductCreateForm usageSummary={usageSummaryQuery.data} /> : null}
    </>
  );
}
