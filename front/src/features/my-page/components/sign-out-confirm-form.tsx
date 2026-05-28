"use client";

import { LogOut } from "lucide-react";

export function SignOutConfirmForm() {
  return (
    <form
      action="/api/auth/sign-out"
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("현재 계정에서 로그아웃할까요?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        로그아웃
      </button>
    </form>
  );
}
