import { revalidatePath } from "next/cache";
import { signInSchema } from "@/features/auth/schemas/auth-form-schema";
import { getPostAuthRedirectPath } from "@/server/auth/redirect";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiErrorBoundary(async (request: Request) => {
  if (!hasSupabasePublicEnv()) {
    return errorResponse(500, "로그인 연결이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
  }

  const payload = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse(400, "입력한 정보를 다시 확인해 주세요.", {
      fieldErrors: parsed.error.flatten().fieldErrors
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return errorResponse(401, "이메일 또는 비밀번호를 확인해 주세요.");
  }

  const redirectTo = await getPostAuthRedirectPath(supabase);
  revalidatePath("/", "layout");

  return successResponse({ redirectTo }, {
    message: "로그인했습니다."
  });
});

export const dynamic = "force-dynamic";
