"use client";

import { useMutation } from "@tanstack/react-query";
import type { StoreFormValues } from "@/features/stores/schemas/store-form-schema";
import { requestJson } from "@/shared/api/http";
import type { Database } from "@/shared/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

export function useCreateStoreMutation() {
  return useMutation({
    mutationFn: (values: StoreFormValues) =>
      requestJson<Store>("/api/stores", {
        method: "POST",
        body: JSON.stringify(values)
      })
  });
}
