import { OrderCreatePageClient } from "@/features/orders/components/order-create-page-client";
import { requireDashboardAccess } from "@/server/auth/session";
import { getOrderProductChoicesForStore } from "@/server/orders/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

export default async function NewOrderPage() {
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(
      queryKeys.orderProductChoices,
      await getOrderProductChoicesForStore(supabase, access.store.id)
    );
  } catch (error) {
    console.error("Failed to prefetch order create product choices", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <OrderCreatePageClient />
    </ServerQueryHydrationBoundary>
  );
}
