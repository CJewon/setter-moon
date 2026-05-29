"use client";

import { SettingsForm } from "@/features/settings/components/settings-form";
import { SettingsOverview } from "@/features/settings/components/settings-overview";
import { SettingsPlanPanel } from "@/features/settings/components/settings-plan-panel";
import { SettingsUsageGrid } from "@/features/settings/components/settings-usage-grid";
import { useSettingsQuery } from "@/features/settings/hooks/use-settings-query";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";

export function SettingsClient() {
  const settingsQuery = useSettingsQuery();

  if (settingsQuery.isLoading) {
    return <QueryLoadingState title="설정 정보를 불러오고 있습니다." variant="form" />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return <QueryErrorState title="설정 정보를 불러오지 못했습니다." />;
  }

  const { plan, store, usageSummary } = settingsQuery.data;
  const isPaidPlan = plan.id === "paid_full";
  const isPlanHealthy = plan.status !== "past_due" && plan.status !== "cancelled";

  return (
    <>
      <SettingsOverview businessType={store.business_type} storeName={store.name} updatedAt={store.updated_at} />
      <SettingsForm businessType={store.business_type} memo={store.memo} storeName={store.name} />
      <SettingsUsageGrid metrics={usageSummary.metrics} />
      <SettingsPlanPanel
        isPaidPlan={isPaidPlan}
        isPlanHealthy={isPlanHealthy}
        planCurrentPeriodEnd={plan.currentPeriodEnd}
      />
    </>
  );
}
