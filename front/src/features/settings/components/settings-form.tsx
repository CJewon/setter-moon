"use client";

import { SettingsStoreSection } from "@/features/settings/components/settings-store-section";
import { SettingsSubmitBar } from "@/features/settings/components/settings-submit-bar";
import { useSettingsForm } from "@/features/settings/hooks/use-settings-form";

type SettingsFormProps = {
  businessType: string | null;
  memo: string | null;
  storeName: string;
};

export function SettingsForm({ businessType, memo, storeName }: SettingsFormProps) {
  const { fieldErrors, handleChange, handleSubmit, isDirty, pending, state } = useSettingsForm({
    businessType,
    memo,
    storeName
  });

  return (
    <form
      id="settings-form"
      className="mb-5 grid gap-4 pb-24 sm:pb-28"
      onChange={handleChange}
      onInput={handleChange}
      onSubmit={handleSubmit}
    >
      <SettingsStoreSection
        businessType={businessType}
        memo={memo}
        memoError={fieldErrors?.memo?.[0]}
        storeName={storeName}
        storeNameError={fieldErrors?.storeName?.[0]}
      />
      {state.status === "error" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
      <SettingsSubmitBar isDirty={isDirty} pending={pending} />
    </form>
  );
}
