"use client";

import { useActionState } from "react";
import { createStoreAction } from "@/features/stores/actions/store-actions";
import { salesChannels } from "@/features/stores/schemas/store-form-schema";
import { initialActionState } from "@/shared/types/action-state";

export function StoreOnboardingForm() {
  const [state, formAction, pending] = useActionState(createStoreAction, initialActionState);

  return (
    <form action={formAction} className="rounded-md border border-slate-200 bg-white p-5">
      {state.message ? (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" aria-live="polite">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium" htmlFor="store-name">
          스토어명
          <input
            id="store-name"
            name="name"
            className="min-h-10 rounded-md border border-slate-300 px-3"
            placeholder="예: 무드웨어"
            required
          />
          {state.fieldErrors?.name ? <span className="text-xs text-red-700">{state.fieldErrors.name[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium" htmlFor="business-type">
          주요 판매 채널
          <select id="business-type" name="businessType" className="min-h-10 rounded-md border border-slate-300 px-3" defaultValue="">
            <option value="">선택 안 함</option>
            {salesChannels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium" htmlFor="memo">
          메모
          <textarea
            id="memo"
            name="memo"
            className="min-h-24 rounded-md border border-slate-300 px-3 py-2"
            placeholder="예: 인스타그램과 스마트스토어 병행"
          />
          {state.fieldErrors?.memo ? <span className="text-xs text-red-700">{state.fieldErrors.memo[0]}</span> : null}
        </label>
      </div>
      <p className="mt-4 text-xs text-slate-500">판매 채널과 메모는 나중에 수정할 수 있습니다.</p>
      <button
        className="mt-5 min-h-10 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "스토어 생성 중..." : "스토어 만들기"}
      </button>
    </form>
  );
}
