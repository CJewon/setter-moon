import { notFound } from "next/navigation";
import { OrderEditPageClient } from "@/features/orders/components/order-edit-page-client";
import { requireDashboardAccess } from "@/server/auth/session";
import { isOrderNotFoundError } from "@/server/orders/errors";
import { getOrderDetailForStore, getOrderProductChoicesForStore } from "@/server/orders/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

type OrderEditPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  const { orderId } = await params;
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    const [order, productChoices] = await Promise.all([
      getOrderDetailForStore(supabase, access.store.id, orderId),
      getOrderProductChoicesForStore(supabase, access.store.id)
    ]);

    queryClient.setQueryData(queryKeys.order(orderId), order);
    queryClient.setQueryData(queryKeys.orderProductChoices, productChoices);
  } catch (error) {
    if (isOrderNotFoundError(error)) {
      notFound();
    }

    console.error("Failed to prefetch order edit data", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <OrderEditPageClient orderId={orderId} />
    </ServerQueryHydrationBoundary>
  );
}
