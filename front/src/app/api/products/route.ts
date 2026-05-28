import { revalidatePath } from "next/cache";
import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import {
  createProductForStore,
  isProductMutationError,
  isProductSchemaMissingError,
  isProductValidationError,
  isProductUsageLimitError
} from "@/server/products/service";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { productCreateSchema } from "@/features/products/schemas/product-form-schema";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "Supabase 환경 변수를 먼저 설정해야 합니다.");
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
      return errorResponse(500, "Supabase 상품 테이블이 아직 준비되지 않았습니다.");
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
