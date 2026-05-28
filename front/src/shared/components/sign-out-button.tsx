"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSignOutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";

export function SignOutButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const signOutMutation = useSignOutMutation();

  function handleSignOut() {
    signOutMutation.mutate(undefined, {
      onSuccess: ({ data }) => {
        router.replace(data.redirectTo as Route);
        router.refresh();
      },
      onError: (error) => {
        const state = getApiErrorState(error, "로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        showToast({
          tone: "error",
          title: "로그아웃 실패",
          message: state.message
        });
      }
    });
  }

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
      disabled={signOutMutation.isPending}
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {signOutMutation.isPending ? "로그아웃 중" : "로그아웃"}
    </button>
  );
}
