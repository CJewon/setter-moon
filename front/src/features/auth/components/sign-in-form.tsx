"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useSignInMutation } from "@/features/auth/hooks/use-auth-mutations";
import { signInSchema } from "@/features/auth/schemas/auth-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { routes } from "@/shared/constants/routes";
import { initialActionState, type ActionState } from "@/shared/types/action-state";
import { cn } from "@/shared/utils/cn";

const rememberedEmailStorageKey = "sellerroom:remembered-email";

export function SignInForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, setState] = useState<ActionState>(initialActionState);
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const signInMutation = useSignInMutation();
  const pending = signInMutation.isPending;
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedEmail = window.localStorage.getItem(rememberedEmailStorageKey) ?? "";

      setEmail((currentEmail) => currentEmail || savedEmail);
      setRememberEmail((currentValue) => currentValue || Boolean(savedEmail));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function handleRememberEmailChange(nextValue: boolean) {
    setRememberEmail(nextValue);

    if (!nextValue) {
      setEmail("");
      window.localStorage.removeItem(rememberedEmailStorageKey);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
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
    signInMutation.mutate(parsed.data, {
      onSuccess: ({ data }) => {
        if (rememberEmail) {
          window.localStorage.setItem(rememberedEmailStorageKey, parsed.data.email);
        } else {
          window.localStorage.removeItem(rememberedEmailStorageKey);
        }

        router.replace(data.redirectTo as Route);
        router.refresh();
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "로그인 실패",
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex w-fit items-center gap-2 text-slate-600" htmlFor="rememberEmail">
          <input
            id="rememberEmail"
            name="rememberEmail"
            type="checkbox"
            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
            checked={rememberEmail}
            onChange={(event) => handleRememberEmailChange(event.target.checked)}
          />
          <span>아이디 저장</span>
        </label>
        <div className="flex items-center gap-2 text-slate-500">
          <Link href={routes.findId} className="font-medium text-blue-700">
            아이디 찾기
          </Link>
          <span aria-hidden className="h-3 w-px bg-slate-300" />
          <Link href={routes.forgotPassword} className="font-medium text-blue-700">
            비밀번호 찾기
          </Link>
        </div>
      </div>
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "로그인 중" : "로그인"}
      </button>
      <p className="text-center text-sm text-slate-600">
        처음 오셨나요?{" "}
        <Link href={routes.signUp} className="font-medium text-blue-700">
          계정 만들기
        </Link>
      </p>
    </form>
  );
}
