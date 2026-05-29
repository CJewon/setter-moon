"use client";

import { useRef, useState, type FormEvent } from "react";
import { getApiErrorState } from "@/shared/api/http";
import { settingsFormSchema } from "@/features/settings/schemas/settings-schema";
import { useSettingsMutation } from "@/features/settings/hooks/use-settings-mutation";
import { useToast } from "@/shared/components/toast-provider";

type SettingsFormSnapshot = {
  businessType: string;
  memo: string;
  storeName: string;
};

type SettingsFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  status: "idle" | "success" | "error";
};

type UseSettingsFormProps = {
  businessType: string | null;
  memo: string | null;
  storeName: string;
};

function normalizeSnapshot(snapshot: SettingsFormSnapshot) {
  return {
    businessType: snapshot.businessType,
    memo: snapshot.memo.trim(),
    storeName: snapshot.storeName.trim()
  };
}

function createSnapshot({ businessType, memo, storeName }: UseSettingsFormProps): SettingsFormSnapshot {
  return {
    businessType: businessType ?? "",
    memo: memo ?? "",
    storeName
  };
}

export function useSettingsForm(props: UseSettingsFormProps) {
  const mutation = useSettingsMutation();
  const { showToast } = useToast();
  const initialSnapshotRef = useRef(createSnapshot(props));
  const [state, setState] = useState<SettingsFormState>({
    status: "idle",
    message: ""
  });
  const [isDirty, setIsDirty] = useState(false);

  const updateDirtyState = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const currentSnapshot = normalizeSnapshot({
      businessType: String(formData.get("businessType") ?? ""),
      memo: String(formData.get("memo") ?? ""),
      storeName: String(formData.get("storeName") ?? "")
    });
    const baseSnapshot = normalizeSnapshot(initialSnapshotRef.current);

    setIsDirty(JSON.stringify(currentSnapshot) !== JSON.stringify(baseSnapshot));
  };

  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    updateDirtyState(event.currentTarget);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      businessType: String(formData.get("businessType") ?? ""),
      memo: String(formData.get("memo") ?? ""),
      storeName: String(formData.get("storeName") ?? "")
    };
    const parsed = settingsFormSchema.safeParse(values);

    if (!parsed.success) {
      setState({
        status: "error",
        message: "입력한 설정 정보를 다시 확인해 주세요.",
        fieldErrors: parsed.error.flatten().fieldErrors
      });
      return;
    }

    try {
      const response = await mutation.mutateAsync(parsed.data);

      initialSnapshotRef.current = createSnapshot({
        businessType: response.data.store.business_type,
        memo: response.data.store.memo,
        storeName: response.data.store.name
      });
      setIsDirty(false);
      setState({
        status: "success",
        message: response.message || "설정 정보를 저장했습니다."
      });
      showToast({
        message: response.message || "설정 정보를 저장했습니다.",
        tone: "success"
      });
    } catch (error) {
      const nextState = getApiErrorState(error, "설정 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setState(nextState);
      showToast({
        message: nextState.message,
        tone: "error"
      });
    }
  };

  return {
    fieldErrors: state.fieldErrors,
    formStatusLabel: mutation.isPending ? "저장 중" : isDirty ? "변경사항 있음" : state.status === "success" ? "저장 완료" : "변경사항 없음",
    handleChange,
    handleSubmit,
    isDirty,
    pending: mutation.isPending,
    state
  };
}
