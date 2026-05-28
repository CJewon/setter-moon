import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { getStoreUsageSummary } from "@/server/usage/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "사용량 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 생성해야 합니다.");
  }

  try {
    return successResponse(await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access)), {
      message: "사용량 정보를 불러왔습니다."
    });
  } catch {
    return errorResponse(500, "사용량 정보를 불러오지 못했습니다.");
  }
});

export const dynamic = "force-dynamic";
