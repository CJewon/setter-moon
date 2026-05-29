"use client";

import { MyPageForm } from "@/features/my-page/components/my-page-form";
import { MyPageOverview, MyPageUsageGrid } from "@/features/my-page/components/my-page-overview";
import { MyPagePlanPanel } from "@/features/my-page/components/my-page-plan-panel";
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

  const { displayName, email, plan, store, usageSummary } = myPageQuery.data;
  const planId = plan.id;
  const isPaidPlan = planId === "paid_full";
  const isPlanHealthy = plan.status !== "past_due" && plan.status !== "cancelled";

  return (
    <>
      <MyPageOverview
        businessType={store.business_type}
        displayName={displayName}
        email={email}
        isPaidPlan={isPaidPlan}
        storeName={store.name}
      />
      <MyPageUsageGrid metrics={usageSummary.metrics} />
      <MyPagePlanPanel
        isPaidPlan={isPaidPlan}
        isPlanHealthy={isPlanHealthy}
        planCurrentPeriodEnd={plan.currentPeriodEnd}
      />
      <MyPageForm
        displayName={displayName}
        email={email}
        storeName={store.name}
        businessType={store.business_type}
        memo={store.memo}
      />
    </>
  );
}
