"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardPageData } from "@/server/dashboard/summary";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => (await requestJson<DashboardPageData>("/api/dashboard")).data
  });
}
