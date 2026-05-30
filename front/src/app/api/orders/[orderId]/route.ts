import { revalidatePath } from "next/cache";
import { orderEditSchema } from "@/features/orders/schemas/order-form-schema";
import { getAppAccess } from "@/server/auth/session";
import {
  isInvalidOrderStatusTransitionError,
  isOrderMutationError,
  isOrderNotFoundError,
  isOrderSchemaMissingError,
  isOrderValidationError,
  getOrderDetailForStore,
  updateOrderBasicForStore
} from "@/server/orders/service";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

type OrderRouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export const GET = withApiErrorBoundary(async (_request: Request, { params }: OrderRouteContext) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const { orderId } = await params;
  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 주문 정보를 볼 수 있습니다.");
  }

  try {
    return successResponse(await getOrderDetailForStore(supabase, access.store.id, orderId), {
      message: "주문 정보를 불러왔습니다."
    });
  } catch (error) {
    console.error("Failed to get order", error);

    if (isOrderNotFoundError(error)) {
      return errorResponse(404, "주문을 찾을 수 없습니다.");
    }

    if (isOrderSchemaMissingError(error)) {
      return errorResponse(500, "주문 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isOrderMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "주문 정보를 볼 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "주문 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const PATCH = withApiErrorBoundary(async (request: Request, { params }: OrderRouteContext) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, orderEditSchema, "주문 정보를 다시 확인해 주세요.");

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
    return errorResponse(404, "스토어를 먼저 만들어야 주문 정보를 수정할 수 있습니다.");
  }

  try {
    const result = await updateOrderBasicForStore(supabase, access.store.id, orderId, parsed.data, access.user.id);

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}/edit`);
    revalidatePath("/inventory");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/dashboard");

    return successResponse(result, {
      message: "주문 정보를 저장했습니다."
    });
  } catch (error) {
    if (isInvalidOrderStatusTransitionError(error)) {
      return errorResponse(409, error.message);
    }

    if (isOrderValidationError(error)) {
      return errorResponse(400, error.message);
    }

    if (isOrderNotFoundError(error)) {
      return errorResponse(404, "주문을 찾을 수 없습니다.");
    }

    if (isOrderSchemaMissingError(error)) {
      return errorResponse(500, "주문 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isOrderMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "주문 정보를 수정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    console.error("Failed to update order", error);

    return errorResponse(500, "주문 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
