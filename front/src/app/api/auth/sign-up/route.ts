import { revalidatePath } from "next/cache";
import { signUpSchema } from "@/features/auth/schemas/auth-form-schema";
import { getSignUpAuthApiError } from "@/features/auth/utils/auth-error";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv, hasSupabaseServerAuthEnv } from "@/shared/lib/env";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv() || !hasSupabaseServerAuthEnv()) {
    return errorResponse(500, "계정 만들기 연결이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = await parseJsonBody(request, signUpSchema, "입력한 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const admin = createAdminClient();
  const { error: createUserError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      name: parsed.data.name
    }
  });

  if (createUserError) {
    const apiError = getSignUpAuthApiError(createUserError);

    return errorResponse(apiError.code, apiError.message, {
      fieldErrors: apiError.fieldErrors
    });
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (signInError) {
    return errorResponse(500, "계정은 만들었지만 로그인하지 못했습니다. 로그인 화면에서 다시 시도해 주세요.");
  }

  revalidatePath("/", "layout");

  return successResponse({ redirectTo: "/onboarding/store" }, {
    message: "계정을 만들었습니다."
  });
});

export const dynamic = "force-dynamic";
