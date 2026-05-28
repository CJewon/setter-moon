import { revalidatePath } from "next/cache";
import { myPageFormSchema } from "@/features/my-page/schemas/my-page-schema";
import {
  isProfileMutationError,
  isProfileSchemaMissingError,
  updateUserDisplayName
} from "@/server/profiles/service";
import { errorResponse, successResponse } from "@/server/shared/error-response";
import { isStoreMutationError, isStoreSchemaMissingError, updateCurrentStoreForUser } from "@/server/stores/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export async function PATCH(request: Request) {
  if (!hasSupabasePublicEnv()) {
    return errorResponse("VALIDATION_ERROR", "계정 정보를 저장할 연결이 아직 준비되지 않았습니다.", 500);
  }

  const payload = await request.json().catch(() => null);
  const parsed = myPageFormSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "입력한 정보를 다시 확인해 주세요.", 422, {
      fieldErrors: parsed.error.flatten().fieldErrors
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  try {
    await updateUserDisplayName(supabase, user.id, parsed.data.displayName?.trim() || null);
    const store = await updateCurrentStoreForUser(supabase, user.id, {
      name: parsed.data.storeName,
      businessType: parsed.data.businessType,
      memo: parsed.data.memo
    });

    revalidatePath("/", "layout");
    revalidatePath("/my-page");

    return successResponse(
      {
        displayName: parsed.data.displayName?.trim() ?? "",
        store
      },
      200,
      {
        message: "마이페이지 정보를 저장했습니다."
      }
    );
  } catch (error) {
    console.error("Failed to update my page", error);

    if (isProfileSchemaMissingError(error) || isStoreSchemaMissingError(error)) {
      return errorResponse("CONFLICT", "Supabase DB 테이블이 아직 준비되지 않았습니다.", 409);
    }

    if (
      (isProfileMutationError(error) || isStoreMutationError(error)) &&
      (error.code === "42501" || error.code === "PGRST301")
    ) {
      return errorResponse("FORBIDDEN", "정보를 수정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.", 403);
    }

    return errorResponse("CONFLICT", "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.", 409);
  }
}

export const dynamic = "force-dynamic";
