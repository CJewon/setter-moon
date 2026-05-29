import { revalidatePath } from "next/cache";
import { getAppAccess } from "@/server/auth/session";
import { orderBulkStatusUpdateSchema } from "@/features/orders/schemas/order-form-schema";
import {
  isOrderMutationError,
  isOrderSchemaMissingError,
  isOrderValidationError,
  updateOrderStatusesForStore
} from "@/server/orders/service";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const PATCH = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, orderBulkStatusUpdateSchema, "변경할 주문과 상태를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 주문 상태를 변경할 수 있습니다.");
  }

  try {
    const result = await updateOrderStatusesForStore(supabase, access.store, parsed.data);

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath("/inventory");
    parsed.data.orderIds.forEach((orderId) => revalidatePath(`/orders/${orderId}`));

    if (result.updatedCount === 0) {
      return errorResponse(409, result.results.find((item) => item.status === "failed")?.message ?? "변경할 수 있는 주문이 없습니다.");
    }

    const message =
      result.failedCount > 0
        ? `${result.updatedCount}건을 변경했습니다. ${result.failedCount}건은 변경하지 못했습니다.`
        : `${result.updatedCount}건을 변경했습니다.`;

    return successResponse(result, { message });
  } catch (error) {
    console.error("Failed to bulk update order status", error);

    if (isOrderValidationError(error)) {
      return errorResponse(400, error.message);
    }

    if (isOrderSchemaMissingError(error)) {
      return errorResponse(500, "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isOrderMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "주문 상태를 변경할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
