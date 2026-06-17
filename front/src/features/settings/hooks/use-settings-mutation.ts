"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/shared/types/database";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import type { SettingsFormValues } from "@/features/settings/schemas/settings-schema";

type Store = Database["public"]["Tables"]["stores"]["Row"];

type UpdateSettingsData = {
  store: Store;
};

export function useSettingsMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SettingsFormValues) =>
      requestJson<UpdateSettingsData>("/api/settings", {
        body: JSON.stringify(values),
        method: "PATCH"
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.currentStore }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}
