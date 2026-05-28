"use client";

import { MyPageAccountSection } from "@/features/my-page/components/my-page-account-section";
import { MyPageStoreSection } from "@/features/my-page/components/my-page-store-section";
import { MyPageSubmitBar } from "@/features/my-page/components/my-page-submit-bar";
import { useMyPageForm } from "@/features/my-page/hooks/use-my-page-form";

type MyPageFormProps = {
  businessType: string | null;
  displayName: string;
  email: string;
  memo: string | null;
  storeName: string;
};

export function MyPageForm({ businessType, displayName, email, memo, storeName }: MyPageFormProps) {
  const {
    fieldErrors,
    formStatusLabel,
    handleChange,
    handleSubmit,
    isDirty,
    pending,
    state
  } = useMyPageForm({ businessType, displayName, memo, storeName });

  return (
    <form
      id="my-page-form"
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-2"
      noValidate
      onChange={handleChange}
    >
      <MyPageAccountSection displayName={displayName} displayNameError={fieldErrors?.displayName?.[0]} email={email} />
      <MyPageStoreSection
        businessType={businessType}
        memo={memo}
        memoError={fieldErrors?.memo?.[0]}
        storeName={storeName}
        storeNameError={fieldErrors?.storeName?.[0]}
      />
      <MyPageSubmitBar
        formStatusLabel={formStatusLabel}
        isDirty={isDirty}
        pending={pending}
        stateStatus={state.status}
      />
    </form>
  );
}
