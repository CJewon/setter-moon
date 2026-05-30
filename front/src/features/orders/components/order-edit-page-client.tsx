"use client";

import { OrderEditForm } from "@/features/orders/components/order-edit-form";
import { useOrderProductChoicesQuery, useOrderQuery } from "@/features/orders/hooks/use-order-queries";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";

type OrderEditPageClientProps = {
  orderId: string;
};

export function OrderEditPageClient({ orderId }: OrderEditPageClientProps) {
  const orderQuery = useOrderQuery(orderId);
  const productChoicesQuery = useOrderProductChoicesQuery();

  if (orderQuery.isLoading || productChoicesQuery.isLoading) {
    return <QueryLoadingState title="주문 수정 정보를 불러오고 있습니다." variant="form" />;
  }

  if (orderQuery.isError || productChoicesQuery.isError || !orderQuery.data || !productChoicesQuery.data) {
    return <QueryErrorState title="주문 수정 정보를 불러오지 못했습니다." />;
  }

  const order = orderQuery.data;

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.orderDetail(orderId),
          label: "주문 상세로"
        }}
      />
      <OrderEditForm
        order={{
          customerName: order.customer_name,
          customerPhone: order.customer_phone ?? undefined,
          id: order.id,
          memo: order.memo ?? undefined,
          orderedAt: order.ordered_at,
          orderNo: order.order_no,
          status: order.status,
          items: order.items
        }}
        products={productChoicesQuery.data}
      />
    </>
  );
}
