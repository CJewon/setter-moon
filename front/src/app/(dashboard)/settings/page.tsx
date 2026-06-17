import { SettingsClient } from "@/features/settings/components/settings-client";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { getStoreUsageSummary } from "@/server/usage/service";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

export default async function SettingsPage() {
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(queryKeys.settings, {
      plan: {
        currentPeriodEnd: access.profile?.plan_current_period_end ?? null,
        id: getAppAccessPlanId(access),
        status: access.profile?.plan_status ?? null
      },
      store: access.store,
      usageSummary: await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access))
    });
  } catch (error) {
    console.error("Failed to prefetch settings data", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <SettingsClient />
    </ServerQueryHydrationBoundary>
  );
}
