"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StoreFormValues } from "@/features/stores/schemas/store-form-schema";
import { requestJson } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import type { Database } from "@/shared/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

export function useCreateStoreMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: StoreFormValues) =>
      requestJson<Store>("/api/stores", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.session }),
        queryClient.invalidateQueries({ queryKey: queryKeys.currentStore }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      router.refresh();
    }
  });
}
