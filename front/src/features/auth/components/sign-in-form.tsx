"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/features/auth/actions/auth-actions";
import { initialActionState } from "@/shared/types/action-state";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialActionState);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-md border border-slate-200 bg-white p-5">
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          }
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-medium" htmlFor="email">
        이메일
        <input
          id="email"
          name="email"
          className="min-h-10 rounded-md border border-slate-300 px-3"
          type="email"
          autoComplete="email"
          required
        />
        {state.fieldErrors?.email ? <span className="text-xs text-red-700">{state.fieldErrors.email[0]}</span> : null}
      </label>
      <label className="grid gap-2 text-sm font-medium" htmlFor="password">
        비밀번호
        <input
          id="password"
          name="password"
          className="min-h-10 rounded-md border border-slate-300 px-3"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.fieldErrors?.password ? (
          <span className="text-xs text-red-700">{state.fieldErrors.password[0]}</span>
        ) : null}
      </label>
      <button
        className="min-h-10 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-sm text-slate-600">
        계정이 없나요?{" "}
        <Link href="/sign-up" className="font-medium text-blue-700">
          가입하기
        </Link>
      </p>
    </form>
  );
}
