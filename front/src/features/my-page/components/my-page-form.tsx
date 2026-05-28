"use client";

import { useActionState } from "react";
import { updateMyPageAction } from "@/features/my-page/actions/my-page-actions";
import { salesChannels } from "@/features/stores/schemas/store-form-schema";
import { initialActionState } from "@/shared/types/action-state";
import { cn } from "@/shared/utils/cn";

type MyPageFormProps = {
  displayName: string;
  email: string;
  storeName: string;
  businessType: string | null;
  memo: string | null;
};

export function MyPageForm({ displayName, email, storeName, businessType, memo }: MyPageFormProps) {
  const [state, formAction, pending] = useActionState(updateMyPageAction, initialActionState);
  const displayNameError = state.fieldErrors?.displayName?.[0];
  const storeNameError = state.fieldErrors?.storeName?.[0];
  const memoError = state.fieldErrors?.memo?.[0];

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-2" noValidate>
      {state.message ? (
        <p
          className={cn(
            "lg:col-span-2 rounded-md border px-3 py-2 text-sm",
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          )}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">계정 정보</h2>
            <p className="mt-1 text-sm text-slate-500">서비스 안에서 표시될 이름을 관리합니다.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="display-name">
            이름
            <input
              id="display-name"
              name="displayName"
              className={cn(
                "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                displayNameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
              defaultValue={displayName}
              maxLength={40}
              placeholder="예: 김셀러"
              aria-describedby={displayNameError ? "display-name-error" : undefined}
            />
            {displayNameError ? (
              <span id="display-name-error" className="text-xs text-red-700">
                {displayNameError}
              </span>
            ) : null}
          </label>
          <div className="grid gap-2 text-sm font-medium text-slate-800">
            이메일
            <p className="min-h-10 break-all rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
              {email}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">스토어 정보</h2>
          <p className="mt-1 text-sm text-slate-500">운영 화면에서 기본으로 사용할 스토어 정보를 관리합니다.</p>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="store-name">
            스토어명
            <input
              id="store-name"
              name="storeName"
              className={cn(
                "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                storeNameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
              defaultValue={storeName}
              maxLength={60}
              required
              aria-describedby={storeNameError ? "store-name-error" : undefined}
            />
            {storeNameError ? (
              <span id="store-name-error" className="text-xs text-red-700">
                {storeNameError}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="business-type">
            판매 채널
            <select
              id="business-type"
              name="businessType"
              className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              defaultValue={businessType ?? ""}
            >
              <option value="">선택 안 함</option>
              {salesChannels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="memo">
            메모
            <textarea
              id="memo"
              name="memo"
              className={cn(
                "min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                memoError && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
              defaultValue={memo ?? ""}
              maxLength={500}
              aria-describedby={memoError ? "memo-error" : undefined}
            />
            {memoError ? (
              <span id="memo-error" className="text-xs text-red-700">
                {memoError}
              </span>
            ) : null}
          </label>
        </div>
      </section>

      <div className="lg:col-span-2 flex justify-end">
        <button
          type="submit"
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          disabled={pending}
        >
          {pending ? "저장 중" : "변경사항 저장"}
        </button>
      </div>
    </form>
  );
}
