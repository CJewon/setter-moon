import { AppShell } from "@/shared/components/app-shell";
import { requireDashboardAccess } from "@/server/auth/session";
import { getDashboardSummary, type DashboardSummary } from "@/server/dashboard/summary";
import { getUserDisplayName } from "@/server/profiles/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

const fallbackDashboardSummary: DashboardSummary = {
  lowStockVariantCount: 0,
  readyToShipOrders: 0,
  receivedOrders: 0,
  shippingOrders: 0,
  todayOrders: 0,
  todaySalesAmount: 0
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();
  const user = {
    email: access.user.email ?? access.profile?.email ?? null,
    id: access.user.id,
    name: getUserDisplayName(access.user, access.profile)
  };
  let dashboardSummary: DashboardSummary | null = null;

  try {
    dashboardSummary = await getDashboardSummary(supabase, access.store);
  } catch (error) {
    console.error("Failed to prefetch dashboard shell data", error);
  }

  queryClient.setQueryData(queryKeys.session, {
    isAuthenticated: true,
    user
  });
  queryClient.setQueryData(queryKeys.currentStore, access.store);

  return (
    <AppShell dashboardSummary={dashboardSummary ?? fallbackDashboardSummary} store={access.store} user={user}>
      <ServerQueryHydrationBoundary queryClient={queryClient}>{children}</ServerQueryHydrationBoundary>
    </AppShell>
  );
}
