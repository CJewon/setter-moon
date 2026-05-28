"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCreateStoreMutation } from "@/features/stores/hooks/use-store-mutations";
import { salesChannels, storeFormSchema } from "@/features/stores/schemas/store-form-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import type { ActionState } from "@/shared/types/action-state";
import { initialActionState } from "@/shared/types/action-state";

export function StoreOnboardingForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, setState] = useState<ActionState>(initialActionState);
  const createStoreMutation = useCreateStoreMutation();
  const pending = createStoreMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = storeFormSchema.safeParse({
      name: formData.get("name"),
      businessType: formData.get("businessType"),
      memo: formData.get("memo")
    });

    if (!parsed.success) {
      setState({
        status: "error",
        message: "스토어 정보를 확인해 주세요.",
        fieldErrors: parsed.error.flatten().fieldErrors
      });
      return;
    }

    setState(initialActionState);
    createStoreMutation.mutate(parsed.data, {
      onSuccess: ({ message }) => {
        showToast({
          tone: "success",
          title: "스토어 생성 완료",
          message: message ?? "스토어를 만들었습니다."
        });
        router.replace("/dashboard");
        router.refresh();
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "스토어를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "스토어 생성 실패",
          message: nextState.message
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5">
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
        type="submit"
        className="mt-5 min-h-10 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? "스토어 생성 중..." : "스토어 만들기"}
      </button>
    </form>
  );
}
