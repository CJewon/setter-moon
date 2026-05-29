"use client";

import { useState, type FormEvent } from "react";
import { useUpdateMyPageMutation } from "@/features/my-page/hooks/use-my-page-mutation";
import { myPageAccountSchema } from "@/features/my-page/schemas/my-page-schema";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { initialActionState, type ActionState } from "@/shared/types/action-state";

export type MyPageFormValuesSnapshot = {
  displayName: string;
};

export type MyPageFormInitialValues = {
  displayName: string;
};

function normalizeSnapshot(values: MyPageFormValuesSnapshot): MyPageFormValuesSnapshot {
  return {
    displayName: values.displayName.trim()
  };
}

function createInitialSnapshot({ displayName }: MyPageFormInitialValues) {
  return normalizeSnapshot({
    displayName
  });
}

function readFormSnapshot(form: HTMLFormElement) {
  const formData = new FormData(form);

  return normalizeSnapshot({
    displayName: String(formData.get("displayName") ?? "")
  });
}

function isSameSnapshot(first: MyPageFormValuesSnapshot, second: MyPageFormValuesSnapshot) {
  return first.displayName === second.displayName;
}

function getFormStatusLabel({ isDirty, pending, state }: { isDirty: boolean; pending: boolean; state: ActionState }) {
  if (pending) {
    return "저장 중";
  }

  if (isDirty) {
    return "변경사항 있음";
  }

  return state.status === "success" ? "저장 완료" : "변경사항 없음";
}

export function useMyPageForm(initialValues: MyPageFormInitialValues) {
  const { showToast } = useToast();
  const [savedSnapshot, setSavedSnapshot] = useState(() => createInitialSnapshot(initialValues));
  const [isDirty, setIsDirty] = useState(false);
  const [state, setState] = useState<ActionState>(initialActionState);
  const updateMyPageMutation = useUpdateMyPageMutation();
  const pending = updateMyPageMutation.isPending;

  function handleChange(event: FormEvent<HTMLFormElement>) {
    setIsDirty(!isSameSnapshot(readFormSnapshot(event.currentTarget), savedSnapshot));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = myPageAccountSchema.safeParse({
      displayName: formData.get("displayName")
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
    updateMyPageMutation.mutate(parsed.data, {
      onSuccess: ({ message }) => {
        setSavedSnapshot(
          normalizeSnapshot({
            displayName: parsed.data.displayName ?? ""
          })
        );
        setIsDirty(false);
        setState({
          status: "success",
          message: message ?? "계정 정보를 저장했습니다."
        });
        showToast({
          tone: "success",
          title: "저장 완료",
          message: message ?? "계정 정보를 저장했습니다."
        });
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "저장 실패",
          message: nextState.message
        });
      }
    });
  }

  return {
    fieldErrors: state.fieldErrors,
    formStatusLabel: getFormStatusLabel({ isDirty, pending, state }),
    handleChange,
    handleSubmit,
    isDirty,
    pending,
    state
  };
}
