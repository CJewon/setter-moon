import { revalidatePath } from "next/cache";
import { myPageAccountSchema } from "@/features/my-page/schemas/my-page-schema";
import {
  isProfileMutationError,
  isProfileSchemaMissingError,
  getUserDisplayName,
  updateUserDisplayName
} from "@/server/profiles/service";
import { getAppAccess } from "@/server/auth/session";
import { parseJsonBody, requireApiUser } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const GET = withApiErrorBoundary(async () => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return errorResponse(401, "로그인이 필요합니다.");
  }

  return successResponse(
    {
      displayName: getUserDisplayName(access.user, access.profile) ?? "",
      email: access.user.email ?? access.profile?.email ?? ""
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

  const parsed = await parseJsonBody(request, myPageAccountSchema, "입력한 정보를 다시 확인해 주세요.");

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

    revalidatePath("/", "layout");
    revalidatePath("/my-page");

    return successResponse(
      {
        displayName: parsed.data.displayName?.trim() ?? ""
      },
      {
        message: "계정 정보를 저장했습니다."
      }
    );
  } catch (error) {
    console.error("Failed to update my page", error);

    if (isProfileSchemaMissingError(error)) {
      return errorResponse(500, "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (isProfileMutationError(error) && (error.code === "42501" || error.code === "PGRST301")) {
      return errorResponse(403, "정보를 수정할 권한을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }

    return errorResponse(500, "정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
});

export const dynamic = "force-dynamic";
