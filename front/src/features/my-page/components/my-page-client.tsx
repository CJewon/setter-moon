"use client";

import { MyPageForm } from "@/features/my-page/components/my-page-form";
import { SettingsPlanPanel } from "@/features/settings/components/settings-plan-panel";
import { SettingsUsageGrid } from "@/features/settings/components/settings-usage-grid";
import { useMyPageQuery } from "@/features/my-page/hooks/use-my-page-query";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";

export function MyPageClient() {
  const myPageQuery = useMyPageQuery();

  if (myPageQuery.isLoading) {
    return <QueryLoadingState title="마이페이지 정보를 불러오고 있습니다." variant="form" />;
  }

  if (myPageQuery.isError || !myPageQuery.data) {
    return <QueryErrorState title="마이페이지 정보를 불러오지 못했습니다." />;
  }

  const { displayName, email, plan, usageSummary } = myPageQuery.data;
  const isPaidPlan = plan.id === "paid_full";
  const isPlanHealthy = plan.status !== "past_due" && plan.status !== "cancelled";

  return (
    <MyPageForm displayName={displayName} email={email}>
      <SettingsUsageGrid metrics={usageSummary.metrics} />
      <SettingsPlanPanel
        isPaidPlan={isPaidPlan}
        isPlanHealthy={isPlanHealthy}
        planCurrentPeriodEnd={plan.currentPeriodEnd}
      />
    </MyPageForm>
  );
}
