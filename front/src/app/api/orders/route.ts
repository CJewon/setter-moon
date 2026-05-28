import { revalidatePath } from "next/cache";
import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import { orderFormSchema } from "@/features/orders/schemas/order-form-schema";
import { createOrderForStore, isOrderMutationError, isOrderSchemaMissingError, isOrderUsageLimitError, isOrderValidationError } from "@/server/orders/service";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, orderFormSchema, "주문 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
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
    const result = await createOrderForStore(supabase, access.store, getAppAccessPlanId(access), parsed.data);

    revalidatePath("/orders");
    revalidatePath(`/orders/${result.orderId}`);
    revalidatePath("/dashboard");

    return successResponse(result, {
      message: "주문접수로 등록했습니다. 실제 재고는 배송대기 전환 시 차감됩니다."
    });
  } catch (error) {
    console.error("Failed to create order", error);

    if (isOrderUsageLimitError(error)) {
      return errorResponse(429, error.message);
    }

    if (isOrderValidationError(error)) {
      return errorResponse(400, error.message);
    }

    if (isOrderSchemaMissingError(error)) {
      return errorResponse(500, "주문을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isOrderMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "주문을 등록할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    if (isOrderMutationError(error) && error.code === "23505") {
      return errorResponse(409, "주문번호가 중복되었습니다. 다시 시도해 주세요.");
    }

    return errorResponse(500, "주문을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
