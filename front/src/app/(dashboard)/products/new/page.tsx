import { ProductCreatePageClient } from "@/features/products/components/product-create-page-client";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { getStoreUsageSummary } from "@/server/usage/service";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

export default async function NewProductPage() {
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(
      queryKeys.usageSummary,
      await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access))
    );
  } catch (error) {
    console.error("Failed to prefetch product create usage summary", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <ProductCreatePageClient />
    </ServerQueryHydrationBoundary>
  );
}
