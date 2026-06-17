import { DashboardPageClient } from "@/features/dashboard/components/dashboard-page-client";
import { requireDashboardAccess } from "@/server/auth/session";
import { getDashboardPageData } from "@/server/dashboard/summary";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

export default async function DashboardPage() {
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(queryKeys.dashboard, await getDashboardPageData(supabase, access.store));
  } catch (error) {
    console.error("Failed to prefetch dashboard page data", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <DashboardPageClient />
    </ServerQueryHydrationBoundary>
  );
}
