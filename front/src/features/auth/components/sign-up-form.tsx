"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useSignUpMutation } from "@/features/auth/hooks/use-auth-mutations";
import { signUpSchema } from "@/features/auth/schemas/auth-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { initialActionState, type ActionState } from "@/shared/types/action-state";
import { cn } from "@/shared/utils/cn";

export function SignUpForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, setState] = useState<ActionState>(initialActionState);
  const signUpMutation = useSignUpMutation();
  const pending = signUpMutation.isPending;
  const nameError = state.fieldErrors?.name?.[0];
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];
  const passwordConfirmError = state.fieldErrors?.passwordConfirm?.[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      passwordConfirm: formData.get("passwordConfirm")
    });

    if (!parsed.success) {
      setState({
        status: "error",
        message: "입력한 정보를 다시 확인해 주세요.",
        fieldErrors: parsed.error.flatten().fieldErrors
      });
      return;
    }

    setState(initialActionState);
    signUpMutation.mutate(parsed.data, {
      onSuccess: ({ data }) => {
        router.replace(data.redirectTo as Route);
        router.refresh();
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "계정을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "계정 생성 실패",
          message: nextState.message
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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
        {pending ? "계정 생성 중" : "계정 만들기"}
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
