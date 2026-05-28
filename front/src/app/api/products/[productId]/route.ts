import { revalidatePath } from "next/cache";
import { getAppAccess } from "@/server/auth/session";
import {
  isProductMutationError,
  isProductNotFoundError,
  isProductSchemaMissingError,
  updateProductBasicForStore
} from "@/server/products/service";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { productEditSchema } from "@/features/products/schemas/product-edit-schema";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

type ProductRouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export const PATCH = withApiErrorBoundary(async (request: Request, { params }: ProductRouteContext) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "상품 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, productEditSchema, "상품 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const { productId } = await params;
  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 상품 정보를 수정할 수 있습니다.");
  }

  try {
    const result = await updateProductBasicForStore(supabase, access.store.id, productId, parsed.data);

    revalidatePath("/products");
    revalidatePath(`/products/${result.productId}`);
    revalidatePath(`/products/${result.productId}/edit`);

    return successResponse(result, {
      message: "상품 정보를 저장했습니다."
    });
  } catch (error) {
    console.error("Failed to update product", error);

    if (isProductNotFoundError(error)) {
      return errorResponse(404, "상품을 찾을 수 없습니다.");
    }

    if (isProductSchemaMissingError(error)) {
      return errorResponse(500, "상품 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isProductMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "상품 정보를 수정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "상품 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
