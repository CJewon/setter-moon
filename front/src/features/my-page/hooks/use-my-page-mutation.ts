"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MyPageAccountValues } from "@/features/my-page/schemas/my-page-schema";
import { requestJson } from "@/shared/api/http";

type UpdateMyPageData = {
  displayName: string;
};

export function useUpdateMyPageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MyPageAccountValues) =>
      requestJson<UpdateMyPageData>("/api/my-page", {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-page"] }),
        queryClient.invalidateQueries({ queryKey: ["session"] })
      ]);
    }
  });
}
