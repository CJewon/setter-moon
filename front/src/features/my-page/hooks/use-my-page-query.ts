"use client";

import { useQuery } from "@tanstack/react-query";
import { requestJson } from "@/shared/api/http";

export type MyPageData = {
  displayName: string;
  email: string;
};

export function useMyPageQuery() {
  return useQuery({
    queryKey: ["my-page"],
    queryFn: async () => (await requestJson<MyPageData>("/api/my-page")).data
  });
}
