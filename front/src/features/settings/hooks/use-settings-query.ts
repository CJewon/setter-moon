"use client";

import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/shared/types/database";
import { requestJson } from "@/shared/api/http";
import type { UsageSummary } from "@/server/usage/usage-policy";

type Store = Database["public"]["Tables"]["stores"]["Row"];

export type SettingsData = {
  plan: {
    currentPeriodEnd: string | null;
    id: string;
    status: string | null;
  };
  store: Store;
  usageSummary: UsageSummary;
};

export function useSettingsQuery() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await requestJson<SettingsData>("/api/settings")).data
  });
}
