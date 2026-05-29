import { revalidatePath } from "next/cache";
import { getAppAccess } from "@/server/auth/session";
import {
  adjustInventoryForStore,
  isInventoryConflictError,
  isInventoryMutationError,
  isInventoryNotFoundError,
  isInventoryValidationError
} from "@/server/inventory/service";
import { inventoryAdjustmentSchema } from "@/features/inventory/schemas/inventory-adjustment-schema";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "재고를 조정하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, inventoryAdjustmentSchema, "재고 조정 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  if (!access.store) {
    return errorResponse(404, "스토어를 먼저 만들어야 재고를 조정할 수 있습니다.");
  }

  try {
    const result = await adjustInventoryForStore(supabase, access.store.id, parsed.data);

    revalidatePath("/dashboard");
    revalidatePath("/inventory");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/movements");
    revalidatePath("/products");
    revalidatePath(`/products/${result.productId}`);

    return successResponse(result, {
      message: "재고를 조정했습니다."
    });
  } catch (error) {
    console.error("Failed to adjust inventory", error);

    if (isInventoryValidationError(error)) {
      return errorResponse(400, error.message);
    }

    if (isInventoryConflictError(error)) {
      return errorResponse(409, error.message);
    }

    if (isInventoryNotFoundError(error)) {
      return errorResponse(404, error.message);
    }

    if (isInventoryMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "재고를 조정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "재고를 조정하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
