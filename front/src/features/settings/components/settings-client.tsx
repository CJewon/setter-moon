"use client";

import { SettingsForm } from "@/features/settings/components/settings-form";
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

  const { store } = settingsQuery.data;

  return <SettingsForm businessType={store.business_type} memo={store.memo} storeName={store.name} />;
}
