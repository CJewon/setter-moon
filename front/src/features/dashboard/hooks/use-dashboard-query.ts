"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardPageData } from "@/server/dashboard/summary";
import { requestJson } from "@/shared/api/http";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await requestJson<DashboardPageData>("/api/dashboard")).data
  });
}
