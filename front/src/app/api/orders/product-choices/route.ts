import { getAppAccess } from "@/server/auth/session";
import { getOrderProductChoicesForStore, isOrderMutationError, isOrderSchemaMissingError } from "@/server/orders/service";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문 등록에 필요한 상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 주문을 등록할 수 있습니다.");
  }

  try {
    return successResponse(await getOrderProductChoicesForStore(supabase, access.store.id), {
      message: "주문 등록에 필요한 상품 정보를 불러왔습니다."
    });
  } catch (error) {
    console.error("Failed to list order product choices", error);

    if (isOrderSchemaMissingError(error)) {
      return errorResponse(500, "주문 등록에 필요한 상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isOrderMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "상품 정보를 볼 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "주문 등록에 필요한 상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
