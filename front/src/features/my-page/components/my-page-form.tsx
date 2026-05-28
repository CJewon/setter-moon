"use client";

import { useActionState, useRef, useState } from "react";
import { updateMyPageAction } from "@/features/my-page/actions/my-page-actions";
import { salesChannels } from "@/features/stores/schemas/store-form-schema";
import { ActionToastBridge } from "@/shared/components/action-toast-bridge";
import { initialActionState, type ActionState } from "@/shared/types/action-state";
import { cn } from "@/shared/utils/cn";

type MyPageFormProps = {
  displayName: string;
  email: string;
  storeName: string;
  businessType: string | null;
  memo: string | null;
};

type MyPageFormSnapshot = {
  displayName: string;
  storeName: string;
  businessType: string;
  memo: string;
};

function normalizeSnapshot(values: MyPageFormSnapshot): MyPageFormSnapshot {
  return {
    displayName: values.displayName.trim(),
    storeName: values.storeName.trim(),
    businessType: values.businessType,
    memo: values.memo.trim()
  };
}

function createInitialSnapshot({
  displayName,
  storeName,
  businessType,
  memo
}: Pick<MyPageFormProps, "displayName" | "storeName" | "businessType" | "memo">): MyPageFormSnapshot {
  return normalizeSnapshot({
    displayName,
    storeName,
    businessType: businessType ?? "",
    memo: memo ?? ""
  });
}

function readFormSnapshot(form: HTMLFormElement): MyPageFormSnapshot {
  const formData = new FormData(form);

  return normalizeSnapshot({
    displayName: String(formData.get("displayName") ?? ""),
    storeName: String(formData.get("storeName") ?? ""),
    businessType: String(formData.get("businessType") ?? ""),
    memo: String(formData.get("memo") ?? "")
  });
}

function isSameSnapshot(first: MyPageFormSnapshot, second: MyPageFormSnapshot) {
  return (
    first.displayName === second.displayName &&
    first.storeName === second.storeName &&
    first.businessType === second.businessType &&
    first.memo === second.memo
  );
}

export function MyPageForm({ displayName, email, storeName, businessType, memo }: MyPageFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() => createInitialSnapshot({ displayName, storeName, businessType, memo }));
  const [isDirty, setIsDirty] = useState(false);
  const [state, formAction, pending] = useActionState(async (prevState: ActionState, formData: FormData) => {
    const nextState = await updateMyPageAction(prevState, formData);

    if (nextState.status === "success") {
      setSavedSnapshot(
        normalizeSnapshot({
          displayName: String(formData.get("displayName") ?? ""),
          storeName: String(formData.get("storeName") ?? ""),
          businessType: String(formData.get("businessType") ?? ""),
          memo: String(formData.get("memo") ?? "")
        })
      );
      setIsDirty(false);
    }

    return nextState;
  }, initialActionState);
  const displayNameError = state.fieldErrors?.displayName?.[0];
  const storeNameError = state.fieldErrors?.storeName?.[0];
  const memoError = state.fieldErrors?.memo?.[0];
  const formStatusLabel = pending
    ? "저장 중"
    : isDirty
      ? "변경사항 있음"
      : state.status === "success"
        ? "저장 완료"
        : "변경사항 없음";

  function updateDirtyState(form: HTMLFormElement) {
    setIsDirty(!isSameSnapshot(readFormSnapshot(form), savedSnapshot));
  }

  return (
    <form
      id="my-page-form"
      ref={formRef}
      action={formAction}
      className="grid gap-4 lg:grid-cols-2"
      noValidate
      onChange={(event) => updateDirtyState(event.currentTarget)}
    >
      <ActionToastBridge state={state} successTitle="저장 완료" errorTitle="저장 실패" />

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

      <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p
          className={cn(
            "text-sm font-medium",
            pending ? "text-blue-700" : isDirty ? "text-amber-700" : state.status === "success" ? "text-emerald-700" : "text-slate-500"
          )}
          aria-live="polite"
        >
          {formStatusLabel}
        </p>
        <button
          type="submit"
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          disabled={pending || !isDirty}
        >
          {pending ? "저장 중" : "변경사항 저장"}
        </button>
      </div>
    </form>
  );
}
