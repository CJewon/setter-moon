import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import { errorResponse, successResponse } from "@/server/shared/error-response";
import { getStoreUsageSummary } from "@/server/usage/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET() {
  if (!hasSupabasePublicEnv()) {
    return errorResponse("VALIDATION_ERROR", "Supabase 환경 변수를 먼저 설정해야 합니다.", 500);
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  }

  if (!access.store) {
    return errorResponse("NOT_FOUND", "스토어를 먼저 생성해야 합니다.", 404);
  }

  try {
    return successResponse(await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access)));
  } catch {
    return errorResponse("CONFLICT", "사용량 정보를 불러오지 못했습니다.", 409);
  }
}

export const dynamic = "force-dynamic";
