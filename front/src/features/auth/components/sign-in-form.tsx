"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/features/auth/actions/auth-actions";
import { PasswordInput } from "@/features/auth/components/password-input";
import { cn } from "@/shared/utils/cn";
import { initialActionState } from "@/shared/types/action-state";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialActionState);
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="email">
        <span>이메일</span>
        <input
          id="email"
          name="email"
          className={cn(
            "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            emailError && "border-red-300 focus:border-red-500 focus:ring-red-100"
          )}
          type="email"
          autoComplete="email"
          aria-describedby={emailError ? "email-error" : undefined}
          required
        />
        {emailError ? (
          <span id="email-error" className="text-xs text-red-700">
            {emailError}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="password">
        <span>비밀번호</span>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          describedBy={passwordError ? "password-error" : undefined}
          hasError={Boolean(passwordError)}
        />
        {passwordError ? (
          <span id="password-error" className="text-xs text-red-700">
            {passwordError}
          </span>
        ) : null}
      </label>
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "로그인 중" : "로그인"}
      </button>
      <p className="text-center text-sm text-slate-600">
        처음 오셨나요?{" "}
        <Link href="/sign-up" className="font-medium text-blue-700">
          계정 만들기
        </Link>
      </p>
    </form>
  );
}
