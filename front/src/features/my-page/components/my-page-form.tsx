"use client";

import type { ReactNode } from "react";
import { MyPageAccountSection } from "@/features/my-page/components/my-page-account-section";
import { MyPageSubmitBar } from "@/features/my-page/components/my-page-submit-bar";
import { useMyPageForm } from "@/features/my-page/hooks/use-my-page-form";

type MyPageFormProps = {
  children?: ReactNode;
  displayName: string;
  email: string;
};

export function MyPageForm({ children, displayName, email }: MyPageFormProps) {
  const {
    fieldErrors,
    formStatusLabel,
    handleChange,
    handleSubmit,
    isDirty,
    pending,
    state
  } = useMyPageForm({ displayName });

  return (
    <form
      id="my-page-form"
      onSubmit={handleSubmit}
      className="grid gap-4"
      noValidate
      onChange={handleChange}
    >
      <MyPageAccountSection displayName={displayName} displayNameError={fieldErrors?.displayName?.[0]} email={email} />
      {children}
      <MyPageSubmitBar
        formStatusLabel={formStatusLabel}
        isDirty={isDirty}
        pending={pending}
        stateStatus={state.status}
      />
    </form>
  );
}
