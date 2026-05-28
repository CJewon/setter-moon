"use server";

import { revalidatePath } from "next/cache";
import { myPageFormSchema } from "@/features/my-page/schemas/my-page-schema";
import { isProfileSchemaMissingError, updateUserDisplayName } from "@/server/profiles/service";
import { isStoreMutationError, isStoreSchemaMissingError, updateCurrentStoreForUser } from "@/server/stores/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";
import type { ActionState } from "@/shared/types/action-state";

function invalidState(message: string, fieldErrors?: ActionState["fieldErrors"]): ActionState {
  return {
    status: "error",
    message,
    fieldErrors
  };
}

export async function updateMyPageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabasePublicEnv()) {
    return invalidState("계정 정보를 저장할 연결이 아직 준비되지 않았습니다.");
  }

  const parsed = myPageFormSchema.safeParse({
    displayName: formData.get("displayName"),
    storeName: formData.get("storeName"),
    businessType: formData.get("businessType"),
    memo: formData.get("memo")
  });

  if (!parsed.success) {
    return invalidState("입력한 정보를 다시 확인해 주세요.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return invalidState("로그인이 필요합니다.");
  }

  try {
    await updateUserDisplayName(supabase, user.id, user.email ?? null, parsed.data.displayName?.trim() || null);
    await updateCurrentStoreForUser(supabase, user.id, {
      name: parsed.data.storeName,
      businessType: parsed.data.businessType,
      memo: parsed.data.memo
    });
  } catch (error) {
    console.error("Failed to update my page", error);

    if (isProfileSchemaMissingError(error) || isStoreSchemaMissingError(error)) {
      return invalidState("Supabase DB 테이블이 아직 준비되지 않았습니다.");
    }

    if (isStoreMutationError(error) && error.code === "42501") {
      return invalidState("스토어 정보를 수정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return invalidState("정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  revalidatePath("/", "layout");
  revalidatePath("/my-page");

  return {
    status: "success",
    message: "마이페이지 정보를 저장했습니다."
  };
}
