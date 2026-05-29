import { getAppAccess } from "@/server/auth/session";
import { listInventoryItemsForStore, type InventoryStatus } from "@/server/inventory/service";
import { getOptionalSearchParam, parsePaginationSearchParams } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

const inventoryPageSizeOptions = [10, 20, 50, 100];
const inventoryStatuses = ["normal", "low", "out"] as const;

export const GET = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "재고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const pagination = parsePaginationSearchParams(request, {
    defaultPageSize: 10,
    pageSizeOptions: inventoryPageSizeOptions
  });

  if (!pagination.ok) {
    return pagination.response;
  }

  const searchParams = new URL(request.url).searchParams;
  const status = getOptionalSearchParam(searchParams, "status");

  if (status && !inventoryStatuses.some((item) => item === status)) {
    return errorResponse(400, "재고 상태 값을 확인해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 재고 목록을 볼 수 있습니다.");
  }

  const result = await listInventoryItemsForStore(supabase, access.store.id, pagination.data, {
    keyword: getOptionalSearchParam(searchParams, "keyword"),
    status: status as InventoryStatus | undefined
  });

  return successResponse(result, {
    message: "재고 목록을 불러왔습니다."
  });
});

export const dynamic = "force-dynamic";
