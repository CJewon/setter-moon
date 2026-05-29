"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MyPageFormValues } from "@/features/my-page/schemas/my-page-schema";
import { requestJson } from "@/shared/api/http";
import type { Database } from "@/shared/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

type UpdateMyPageData = {
  displayName: string;
  store: Store;
};

export function useUpdateMyPageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MyPageFormValues) =>
      requestJson<UpdateMyPageData>("/api/my-page", {
        method: "PATCH",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-page"] }),
        queryClient.invalidateQueries({ queryKey: ["session"] }),
        queryClient.invalidateQueries({ queryKey: ["current-store"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}
