import { revalidatePath } from "next/cache";
import { getAppAccess } from "@/server/auth/session";
import { orderStatusUpdateSchema } from "@/features/orders/schemas/order-form-schema";
import {
  isInsufficientStockError,
  isInvalidOrderStatusTransitionError,
  isOrderMutationError,
  isOrderNotFoundError,
  isOrderSchemaMissingError,
  isOrderValidationError,
  updateOrderStatusForStore
} from "@/server/orders/service";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

type OrderStatusRouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export const PATCH = withApiErrorBoundary(async (request: Request, { params }: OrderStatusRouteContext) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, orderStatusUpdateSchema, "변경할 주문 상태를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const { orderId } = await params;
  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 주문 상태를 변경할 수 있습니다.");
  }

  try {
    const result = await updateOrderStatusForStore(supabase, access.store, orderId, parsed.data);

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/dashboard");
    revalidatePath("/products");

    const message =
      result.status === "ready_to_ship"
        ? "배송대기로 변경하고 재고를 차감했습니다."
        : result.status === "cancelled"
          ? "주문 상태를 취소로 변경했습니다."
          : "주문 상태를 변경했습니다.";

    return successResponse(result, { message });
  } catch (error) {
    console.error("Failed to update order status", error);

    if (isInsufficientStockError(error)) {
      return errorResponse(409, error.message);
    }

    if (isInvalidOrderStatusTransitionError(error)) {
      return errorResponse(409, error.message);
    }

    if (isOrderValidationError(error)) {
      return errorResponse(400, error.message);
    }

    if (isOrderNotFoundError(error)) {
      return errorResponse(404, error.message);
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
