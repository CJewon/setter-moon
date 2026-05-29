import { revalidatePath } from "next/cache";
import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import {
  createProductForStore,
  isProductMutationError,
  isProductSchemaMissingError,
  listProductsForStore,
  isProductValidationError,
  isProductUsageLimitError
} from "@/server/products/service";
import { getOptionalSearchParam, parseJsonBody, parsePaginationSearchParams } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { productCreateSchema } from "@/features/products/schemas/product-form-schema";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

const productPageSizeOptions = [10, 20, 50];
const productStatuses = ["active", "sold_out", "hidden"] as const;

export const GET = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const pagination = parsePaginationSearchParams(request, {
    defaultPageSize: 10,
    pageSizeOptions: productPageSizeOptions
  });

  if (!pagination.ok) {
    return pagination.response;
  }

  const searchParams = new URL(request.url).searchParams;
  const status = getOptionalSearchParam(searchParams, "status");

  if (status && !productStatuses.some((item) => item === status)) {
    return errorResponse(400, "판매 상태 값을 확인해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 상품 목록을 볼 수 있습니다.");
  }

  try {
    const result = await listProductsForStore(supabase, access.store.id, pagination.data, {
      keyword: getOptionalSearchParam(searchParams, "keyword"),
      status: status as (typeof productStatuses)[number] | undefined
    });

    return successResponse(result, {
      message: "상품 목록을 불러왔습니다."
    });
  } catch (error) {
    console.error("Failed to list products", error);

    if (isProductSchemaMissingError(error)) {
      return errorResponse(500, "상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isProductMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "상품 목록을 볼 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "상품을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, productCreateSchema, "상품 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 상품을 등록할 수 있습니다.");
  }

  try {
    const result = await createProductForStore(supabase, access.store, getAppAccessPlanId(access), parsed.data);

    revalidatePath("/products");
    revalidatePath(`/products/${result.productId}`);

    return successResponse(result, {
      message: "상품을 등록했습니다."
    });
  } catch (error) {
    console.error("Failed to create product", error);

    if (isProductUsageLimitError(error)) {
      return errorResponse(429, error.message);
    }

    if (isProductValidationError(error)) {
      return errorResponse(400, error.message);
    }

    if (isProductSchemaMissingError(error)) {
      return errorResponse(500, "상품을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isProductMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "상품을 등록할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    if (isProductMutationError(error) && error.code === "23505") {
      return errorResponse(409, "이미 같은 이름의 옵션 조합이 있습니다.");
    }

    return errorResponse(500, "상품을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
