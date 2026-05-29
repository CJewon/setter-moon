import { revalidatePath } from "next/cache";
import { myPageFormSchema } from "@/features/my-page/schemas/my-page-schema";
import {
  isProfileMutationError,
  isProfileSchemaMissingError,
  getUserDisplayName,
  updateUserDisplayName
} from "@/server/profiles/service";
import { getAppAccess, getAppAccessPlanId } from "@/server/auth/session";
import { parseJsonBody, requireApiUser } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import {
  getCurrentStore,
  isStoreMutationError,
  isStoreNotFoundError,
  isStoreSchemaMissingError,
  updateCurrentStoreForUser
} from "@/server/stores/service";
import { getStoreUsageSummary } from "@/server/usage/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const supabase = await createClient();
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  const store = access.store ?? (await getCurrentStore(supabase, access.user.id));

  if (!store) {
    return errorResponse(404, "스토어를 먼저 생성해 주세요.");
  }

  const usageSummary = await getStoreUsageSummary(supabase, store, getAppAccessPlanId(access));

  return successResponse(
    {
      displayName: getUserDisplayName(access.user, access.profile) ?? "",
      email: access.user.email ?? access.profile?.email ?? "",
      store,
      usageSummary
    },
    {
      message: "마이페이지 정보를 불러왔습니다."
    }
  );
});

export const PATCH = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, myPageFormSchema, "입력한 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const supabase = await createClient();
  const userResult = await requireApiUser(supabase);

  if (!userResult.ok) {
    return userResult.response;
  }

  try {
    await updateUserDisplayName(supabase, userResult.data.id, parsed.data.displayName?.trim() || null);
    const store = await updateCurrentStoreForUser(supabase, userResult.data.id, {
      name: parsed.data.storeName,
      businessType: parsed.data.businessType,
      memo: parsed.data.memo
    });

    revalidatePath("/", "layout");
    revalidatePath("/my-page");

    return successResponse(
      {
        displayName: parsed.data.displayName?.trim() ?? "",
        store
      },
      {
        message: "마이페이지 정보를 저장했습니다."
      }
    );
  } catch (error) {
    console.error("Failed to update my page", error);

    if (isProfileSchemaMissingError(error) || isStoreSchemaMissingError(error)) {
      return errorResponse(500, "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (
      (isProfileMutationError(error) || isStoreMutationError(error)) &&
      (error.code === "42501" || error.code === "PGRST301")
    ) {
      return errorResponse(403, "정보를 수정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    if (isStoreNotFoundError(error)) {
      return errorResponse(404, "스토어를 먼저 생성해 주세요.");
    }

    return errorResponse(500, "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
