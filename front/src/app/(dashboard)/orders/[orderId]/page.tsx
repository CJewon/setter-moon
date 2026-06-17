import { notFound } from "next/navigation";
import { OrderDetailPageClient } from "@/features/orders/components/order-detail-page-client";
import { requireDashboardAccess } from "@/server/auth/session";
import { isOrderNotFoundError } from "@/server/orders/errors";
import { getOrderDetailForStore } from "@/server/orders/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(queryKeys.order(orderId), await getOrderDetailForStore(supabase, access.store.id, orderId));
  } catch (error) {
    if (isOrderNotFoundError(error)) {
      notFound();
    }

    console.error("Failed to prefetch order detail", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <OrderDetailPageClient orderId={orderId} />
    </ServerQueryHydrationBoundary>
  );
}
