"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/shared/types/database";
import { requestJson } from "@/shared/api/http";
import type { SettingsFormValues } from "@/features/settings/schemas/settings-schema";

type Store = Database["public"]["Tables"]["stores"]["Row"];

type UpdateSettingsData = {
  store: Store;
};

export function useSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SettingsFormValues) =>
      requestJson<UpdateSettingsData>("/api/settings", {
        body: JSON.stringify(values),
        method: "PATCH"
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["settings"] }),
        queryClient.invalidateQueries({ queryKey: ["current-store"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}
