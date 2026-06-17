import { MyPageClient } from "@/features/my-page/components/my-page-client";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { getUserDisplayName } from "@/server/profiles/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { getStoreUsageSummary } from "@/server/usage/service";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

export default async function MyPage() {
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(queryKeys.myPage, {
      displayName: getUserDisplayName(access.user, access.profile) ?? "",
      email: access.user.email ?? access.profile?.email ?? "",
      plan: {
        currentPeriodEnd: access.profile?.plan_current_period_end ?? null,
        id: getAppAccessPlanId(access),
        status: access.profile?.plan_status ?? null
      },
      usageSummary: await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access))
    });
  } catch (error) {
    console.error("Failed to prefetch my page data", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <MyPageClient />
    </ServerQueryHydrationBoundary>
  );
}
