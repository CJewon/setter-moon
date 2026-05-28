import { storeFormSchema } from "@/features/stores/schemas/store-form-schema";
import { createStoreForUser, getCurrentStore, isStoreMutationError, isStoreSchemaMissingError } from "@/server/stores/service";
import { errorResponse, successResponse } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET() {
  if (!hasSupabasePublicEnv()) {
    return errorResponse("VALIDATION_ERROR", "Supabase 환경 변수를 먼저 설정해야 합니다.", 500);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  return successResponse(await getCurrentStore(supabase, user.id));
}

export async function POST(request: Request) {
  if (!hasSupabasePublicEnv()) {
    return errorResponse("VALIDATION_ERROR", "Supabase 환경 변수를 먼저 설정해야 합니다.", 500);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  const payload = await request.json().catch(() => null);
  const parsed = storeFormSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "스토어 정보를 확인해 주세요.", 422);
  }

  try {
    const store = await createStoreForUser(supabase, user.id, parsed.data);

    return successResponse(store, 201, {
      message: "스토어를 만들었습니다."
    });
  } catch (error) {
    console.error("Failed to create store", error);

    if (isStoreSchemaMissingError(error)) {
      return errorResponse("CONFLICT", "Supabase DB 테이블이 아직 준비되지 않았습니다.", 409);
    }

    if (isStoreMutationError(error) && error.code === "42501") {
      return errorResponse("FORBIDDEN", "스토어를 만들 권한을 확인하지 못했습니다. 다시 로그인해 주세요.", 403);
    }

    return errorResponse("CONFLICT", "스토어를 만들지 못했습니다.", 409);
  }
}

export const dynamic = "force-dynamic";
