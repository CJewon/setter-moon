"use client";

import { useQuery } from "@tanstack/react-query";
import { requestJson } from "@/shared/api/http";
import type { UsageSummary } from "@/server/usage/usage-policy";

export type MyPageData = {
  displayName: string;
  email: string;
  plan: {
    currentPeriodEnd: string | null;
    id: string;
    status: string | null;
  };
  usageSummary: UsageSummary;
};

export function useMyPageQuery() {
  return useQuery({
    queryKey: ["my-page"],
    queryFn: async () => (await requestJson<MyPageData>("/api/my-page")).data
  });
}
