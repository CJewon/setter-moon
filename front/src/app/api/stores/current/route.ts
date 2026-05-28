import { getCurrentStore } from "@/server/stores/service";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "Supabase 환경 변수를 먼저 설정해야 합니다.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  const store = await getCurrentStore(supabase, user.id);

  return successResponse(store, {
    message: store ? "현재 스토어를 불러왔습니다." : "생성된 스토어가 없습니다."
  });
});

export const dynamic = "force-dynamic";
