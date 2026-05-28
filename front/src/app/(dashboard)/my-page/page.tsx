import { MyPageForm } from "@/features/my-page/components/my-page-form";
import { MyPageOverview, MyPageUsageGrid } from "@/features/my-page/components/my-page-overview";
import { MyPagePlanPanel } from "@/features/my-page/components/my-page-plan-panel";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { getUserDisplayName } from "@/server/profiles/service";
import { getStoreUsageSummary } from "@/server/usage/service";
import { PageHeader } from "@/shared/components/page-header";
import { createClient } from "@/shared/lib/supabase/server";

export default async function MyPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const displayName = getUserDisplayName(access.user, access.profile) ?? "";
  const email = access.user.email ?? access.profile?.email ?? "-";
  const planId = getAppAccessPlanId(access);
  const usageSummary = await getStoreUsageSummary(supabase, access.store, planId);
  const isPaidPlan = planId === "paid_full";
  const isPlanHealthy = access.profile?.plan_status !== "past_due" && access.profile?.plan_status !== "cancelled";

  return (
    <>
      <PageHeader title="마이페이지" description="계정, 스토어, 플랜 사용 상태를 확인합니다." />

      <MyPageOverview
        businessType={access.store.business_type}
        displayName={displayName}
        email={email}
        isPaidPlan={isPaidPlan}
        storeName={access.store.name}
      />
      <MyPageUsageGrid metrics={usageSummary.metrics} />
      <MyPagePlanPanel
        isPaidPlan={isPaidPlan}
        isPlanHealthy={isPlanHealthy}
        planCurrentPeriodEnd={access.profile?.plan_current_period_end}
      />
      <MyPageForm
        displayName={displayName}
        email={email}
        storeName={access.store.name}
        businessType={access.store.business_type}
        memo={access.store.memo}
      />
    </>
  );
}
