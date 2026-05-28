"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { routes } from "@/shared/constants/routes";
import { initialActionState, type ActionState } from "@/shared/types/action-state";
import { cn } from "@/shared/utils/cn";

export function ForgotPasswordForm() {
  const { showToast } = useToast();
  const [state, setState] = useState<ActionState>(initialActionState);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const pending = forgotPasswordMutation.isPending;
  const emailError = state.fieldErrors?.email?.[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email")
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
    forgotPasswordMutation.mutate(parsed.data, {
      onSuccess: ({ message }) => {
        setState({
          status: "success",
          message
        });
        showToast({
          tone: "success",
          title: "요청 접수",
          message
        });
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "비밀번호 찾기 요청을 처리하지 못했습니다.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "확인 필요",
          message: nextState.message
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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

      {state.message ? (
        <p
          className={cn(
            "rounded-md px-3 py-2 text-sm leading-6",
            state.status === "success" ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-700"
          )}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "요청 중" : "비밀번호 찾기"}
      </button>

      <p className="text-center text-sm text-slate-600">
        비밀번호가 기억나셨나요?{" "}
        <Link href={routes.signIn} className="font-medium text-blue-700">
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  );
}
