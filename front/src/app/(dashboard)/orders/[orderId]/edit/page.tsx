import { notFound } from "next/navigation";
import { OrderEditForm } from "@/features/orders/components/order-edit-form";
import { requireDashboardAccess } from "@/server/auth/session";
import { getOrderDetailForStore, isOrderNotFoundError } from "@/server/orders/service";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { routes } from "@/shared/constants/routes";
import { createClient } from "@/shared/lib/supabase/server";

type OrderEditPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  const { orderId } = await params;
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const order = await (async () => {
    try {
      return await getOrderDetailForStore(supabase, access.store.id, orderId);
    } catch (error) {
      if (isOrderNotFoundError(error)) {
        notFound();
      }

      throw error;
    }
  })();

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
          status: order.status
        }}
      />
    </>
  );
}
