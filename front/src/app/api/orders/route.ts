import { revalidatePath } from "next/cache";
import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import { orderFormSchema } from "@/features/orders/schemas/order-form-schema";
import { createOrderForStore, isOrderMutationError, isOrderSchemaMissingError, isOrderUsageLimitError, isOrderValidationError, listOrdersForStore, type OrderSort } from "@/server/orders/service";
import { getOptionalSearchParam, parseJsonBody, parsePaginationSearchParams } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";
import type { OrderStatus } from "@/shared/types/domain";

const orderPageSizeOptions = [10, 20, 50, 100];
const orderStatuses = ["received", "ready_to_ship", "shipping", "delivered", "cancelled", "hold"] as const;
const orderSortOptions = ["latest", "oldest"] as const;

function isDateParam(value: string | undefined) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export const GET = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "주문 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const pagination = parsePaginationSearchParams(request, {
    defaultPageSize: 10,
    pageSizeOptions: orderPageSizeOptions
  });

  if (!pagination.ok) {
    return pagination.response;
  }

  const searchParams = new URL(request.url).searchParams;
  const status = getOptionalSearchParam(searchParams, "status");
  const sort = getOptionalSearchParam(searchParams, "sort") ?? "latest";
  const fromDate = getOptionalSearchParam(searchParams, "fromDate");
  const toDate = getOptionalSearchParam(searchParams, "toDate");

  if (status && !orderStatuses.some((item) => item === status)) {
    return errorResponse(400, "주문 상태 값을 확인해 주세요.");
  }

  if (!orderSortOptions.some((item) => item === sort)) {
    return errorResponse(400, "정렬 값을 확인해 주세요.");
  }

  if (!isDateParam(fromDate) || !isDateParam(toDate)) {
    return errorResponse(400, "조회 기간은 YYYY-MM-DD 형식으로 입력해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 주문 목록을 볼 수 있습니다.");
  }

  try {
    const result = await listOrdersForStore(
      supabase,
      access.store.id,
      {
        customerKeyword: getOptionalSearchParam(searchParams, "customerKeyword"),
        fromDate,
        keyword: getOptionalSearchParam(searchParams, "keyword"),
        productKeyword: getOptionalSearchParam(searchParams, "productKeyword"),
        sort: sort as OrderSort,
        status: status as OrderStatus | undefined,
        toDate
      },
      pagination.data
    );

    return successResponse(result, {
      message: "주문 목록을 불러왔습니다."
    });
  } catch (error) {
    console.error("Failed to list orders", error);

    if (isOrderSchemaMissingError(error)) {
      return errorResponse(500, "주문 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isOrderMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "주문 목록을 볼 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "주문 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

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
