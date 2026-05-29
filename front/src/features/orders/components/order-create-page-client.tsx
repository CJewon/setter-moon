"use client";

import { OrderCreateForm } from "@/features/orders/components/order-create-form";
import { useOrderProductChoicesQuery } from "@/features/orders/hooks/use-order-queries";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";

export function OrderCreatePageClient() {
  const productsQuery = useOrderProductChoicesQuery();

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.orders,
          label: "주문 목록으로"
        }}
      />
      {productsQuery.isLoading ? <QueryLoadingState title="주문 등록 정보를 불러오고 있습니다." variant="form" /> : null}
      {productsQuery.isError ? <QueryErrorState title="주문 등록 정보를 불러오지 못했습니다." /> : null}
      {productsQuery.data ? <OrderCreateForm products={productsQuery.data} /> : null}
    </>
  );
}
