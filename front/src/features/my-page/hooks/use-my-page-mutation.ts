"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MyPageAccountValues } from "@/features/my-page/schemas/my-page-schema";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";

type UpdateMyPageData = {
  displayName: string;
};

export function useUpdateMyPageMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MyPageAccountValues) =>
      requestJson<UpdateMyPageData>("/api/my-page", {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myPage }),
        queryClient.invalidateQueries({ queryKey: queryKeys.session })
      ]);
      router.refresh();
    }
  });
}
