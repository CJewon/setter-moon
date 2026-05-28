import { storeFormSchema } from "@/features/stores/schemas/store-form-schema";
import { createStoreForUser, getCurrentStore, isStoreMutationError, isStoreSchemaMissingError } from "@/server/stores/service";
import { parseJsonBody, requireApiUser } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "Supabase 환경 변수를 먼저 설정해야 합니다.");
  }

  const supabase = await createClient();
  const userResult = await requireApiUser(supabase);

  if (!userResult.ok) {
    return userResult.response;
  }

  return successResponse(await getCurrentStore(supabase, userResult.data.id), {
    message: "스토어 정보를 불러왔습니다."
  });
});

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "Supabase 환경 변수를 먼저 설정해야 합니다.");
  }

  const supabase = await createClient();
  const userResult = await requireApiUser(supabase);

  if (!userResult.ok) {
    return userResult.response;
  }

  const parsed = await parseJsonBody(request, storeFormSchema, "스토어 정보를 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const store = await createStoreForUser(supabase, userResult.data.id, parsed.data);

    return successResponse(store, {
      message: "스토어를 만들었습니다."
    });
  } catch (error) {
    console.error("Failed to create store", error);

    if (isStoreSchemaMissingError(error)) {
      return errorResponse(500, "Supabase DB 테이블이 아직 준비되지 않았습니다.");
    }

    if (isStoreMutationError(error) && error.code === "42501") {
      return errorResponse(403, "스토어를 만들 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "스토어를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
