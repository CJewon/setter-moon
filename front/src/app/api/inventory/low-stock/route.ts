import { getAppAccess } from "@/server/auth/session";
import { listLowStockItemsForStore } from "@/server/inventory/service";
import { parsePaginationSearchParams } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

const inventoryPageSizeOptions = [10, 20, 50, 100];

export const GET = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "부족 재고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const pagination = parsePaginationSearchParams(request, {
    defaultPageSize: 10,
    pageSizeOptions: inventoryPageSizeOptions
  });

  if (!pagination.ok) {
    return pagination.response;
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 부족 재고를 볼 수 있습니다.");
  }

  return successResponse(await listLowStockItemsForStore(supabase, access.store.id, pagination.data), {
    message: "부족 재고를 불러왔습니다."
  });
});

export const dynamic = "force-dynamic";
