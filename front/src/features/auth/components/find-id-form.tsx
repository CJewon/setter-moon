"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useFindIdMutation } from "@/features/auth/hooks/use-auth-mutations";
import { findIdSchema } from "@/features/auth/schemas/auth-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { routes } from "@/shared/constants/routes";
import { useToast } from "@/shared/components/toast-provider";
import { initialActionState, type ActionState } from "@/shared/types/action-state";
import { cn } from "@/shared/utils/cn";

export function FindIdForm() {
  const { showToast } = useToast();
  const [state, setState] = useState<ActionState>(initialActionState);
  const findIdMutation = useFindIdMutation();
  const pending = findIdMutation.isPending;
  const nameError = state.fieldErrors?.name?.[0];
  const storeNameError = state.fieldErrors?.storeName?.[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = findIdSchema.safeParse({
      name: formData.get("name"),
      storeName: formData.get("storeName")
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
    findIdMutation.mutate(parsed.data, {
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
        const nextState = getApiErrorState(error, "아이디 찾기 요청을 처리하지 못했습니다.");
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

      <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="storeName">
        <span>스토어명</span>
        <input
          id="storeName"
          name="storeName"
          className={cn(
            "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            storeNameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
          )}
          autoComplete="organization"
          aria-describedby={storeNameError ? "store-name-error" : undefined}
          required
        />
        {storeNameError ? (
          <span id="store-name-error" className="text-xs text-red-700">
            {storeNameError}
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
        {pending ? "확인 중" : "아이디 찾기"}
      </button>

      <p className="text-center text-sm text-slate-600">
        기억나셨나요?{" "}
        <Link href={routes.signIn} className="font-medium text-blue-700">
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  );
}
