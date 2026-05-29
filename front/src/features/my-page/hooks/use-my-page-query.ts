"use client";

import { useQuery } from "@tanstack/react-query";
import type { Store } from "@/server/stores/service";
import type { UsageSummary } from "@/server/usage/usage-policy";
import { requestJson } from "@/shared/api/http";

export type MyPageData = {
  displayName: string;
  email: string;
  plan: {
    currentPeriodEnd: string | null;
    id: "free" | "paid_full";
    status: "active" | "cancelled" | "past_due" | null;
  };
  store: Store;
  usageSummary: UsageSummary;
};

export function useMyPageQuery() {
  return useQuery({
    queryKey: ["my-page"],
    queryFn: async () => (await requestJson<MyPageData>("/api/my-page")).data
  });
}
