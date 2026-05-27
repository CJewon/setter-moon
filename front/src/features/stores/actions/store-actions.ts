"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { storeFormSchema } from "@/features/stores/schemas/store-form-schema";
import { createStoreForUser, isStoreMutationError, isStoreSchemaMissingError } from "@/server/stores/service";
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

export async function createStoreAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabasePublicEnv()) {
    return invalidState("Supabase 환경 변수를 먼저 설정해야 합니다.");
  }

  const parsed = storeFormSchema.safeParse({
    name: formData.get("name"),
    businessType: formData.get("businessType"),
    memo: formData.get("memo")
  });

  if (!parsed.success) {
    return invalidState("스토어 정보를 확인해 주세요.", parsed.error.flatten().fieldErrors);
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
    await createStoreForUser(supabase, user.id, parsed.data);
  } catch (error) {
    console.error("Failed to create store", error);

    if (isStoreSchemaMissingError(error)) {
      return invalidState("Supabase DB 테이블이 아직 준비되지 않았습니다. 초기 스키마를 먼저 적용해 주세요.");
    }

    if (isStoreMutationError(error) && error.code === "42501") {
      return invalidState("스토어를 만들 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return invalidState("스토어를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
