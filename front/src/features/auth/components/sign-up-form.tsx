"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/features/auth/actions/auth-actions";
import { PasswordInput } from "@/features/auth/components/password-input";
import { cn } from "@/shared/utils/cn";
import { initialActionState } from "@/shared/types/action-state";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialActionState);
  const nameError = state.fieldErrors?.name?.[0];
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];
  const passwordConfirmError = state.fieldErrors?.passwordConfirm?.[0];

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
      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="name">
        <span>이름</span>
        <input
          id="name"
          name="name"
          className={cn(
            "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            nameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
          )}
          autoComplete="name"
          aria-describedby={nameError ? "name-error" : undefined}
          required
        />
        {nameError ? (
          <span id="name-error" className="text-xs text-red-700">
            {nameError}
          </span>
        ) : null}
      </label>
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
          autoComplete="new-password"
          describedBy={passwordError ? "password-error" : "password-hint"}
          hasError={Boolean(passwordError)}
        />
        {passwordError ? (
          <span id="password-error" className="text-xs text-red-700">
            {passwordError}
          </span>
        ) : (
          <span id="password-hint" className="text-xs text-slate-500">
            영문과 숫자 포함 8자 이상
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="passwordConfirm">
        <span>비밀번호 확인</span>
        <PasswordInput
          id="passwordConfirm"
          name="passwordConfirm"
          autoComplete="new-password"
          describedBy={passwordConfirmError ? "password-confirm-error" : undefined}
          hasError={Boolean(passwordConfirmError)}
        />
        {passwordConfirmError ? (
          <span id="password-confirm-error" className="text-xs text-red-700">
            {passwordConfirmError}
          </span>
        ) : null}
      </label>
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "계정 만드는 중" : "계정 만들기"}
      </button>
      <p className="text-center text-sm text-slate-600">
        이미 계정이 있나요?{" "}
        <Link href="/sign-in" className="font-medium text-blue-700">
          로그인
        </Link>
      </p>
    </form>
  );
}
