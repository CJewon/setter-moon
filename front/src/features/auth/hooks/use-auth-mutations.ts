"use client";

import { useMutation } from "@tanstack/react-query";
import type { SignInValues, SignUpValues } from "@/features/auth/schemas/auth-form-schema";
import { requestJson } from "@/shared/api/http";

type AuthRedirectData = {
  redirectTo: string;
};

export function useSignInMutation() {
  return useMutation({
    mutationFn: (values: SignInValues) =>
      requestJson<AuthRedirectData>("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(values)
      })
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (values: SignUpValues) =>
      requestJson<AuthRedirectData>("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(values)
      })
  });
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: () =>
      requestJson<AuthRedirectData>("/api/auth/sign-out", {
        method: "POST"
      })
  });
}
