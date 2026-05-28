"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User, UserCircle } from "lucide-react";
import { useSignOutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";

type UserMenuProps = {
  displayName: string;
  email: string | null;
  storeName: string | null;
};

export function UserMenu({ displayName, email, storeName }: UserMenuProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const signOutMutation = useSignOutMutation();

  function handleSignOut() {
    signOutMutation.mutate(undefined, {
      onSuccess: ({ data }) => {
        setIsOpen(false);
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
    <div className="relative">
      <button
        type="button"
        className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <UserCircle className="h-5 w-5 text-slate-500" aria-hidden="true" />
        <span className="hidden max-w-28 truncate sm:inline">{displayName}</span>
      </button>
      {isOpen ? (
        <div
          className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
          role="menu"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-950">{displayName}</p>
            {email ? <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p> : null}
            {storeName ? <p className="mt-2 truncate text-xs font-semibold text-blue-700">{storeName}</p> : null}
          </div>
          <Link
            href={"/my-page" as Route}
            role="menuitem"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4 text-slate-500" aria-hidden="true" />
            마이페이지
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            disabled={signOutMutation.isPending}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 text-slate-500" aria-hidden="true" />
            {signOutMutation.isPending ? "로그아웃 중" : "로그아웃"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
