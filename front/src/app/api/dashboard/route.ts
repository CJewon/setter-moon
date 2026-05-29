import { getAppAccess } from "@/server/auth/session";
import { getDashboardPageData } from "@/server/dashboard/summary";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "대시보드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 대시보드를 볼 수 있습니다.");
  }

  return successResponse(await getDashboardPageData(supabase, access.store), {
    message: "대시보드 정보를 불러왔습니다."
  });
});

export const dynamic = "force-dynamic";
