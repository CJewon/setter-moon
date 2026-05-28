import { revalidatePath } from "next/cache";
import { signInSchema } from "@/features/auth/schemas/auth-form-schema";
import { getPostAuthRedirectPath } from "@/server/auth/redirect";
import { errorResponse, successResponse } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasSupabasePublicEnv()) {
    return errorResponse("VALIDATION_ERROR", "로그인 연결이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.", 500);
  }

  const payload = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "입력한 정보를 다시 확인해 주세요.", 422, {
      fieldErrors: parsed.error.flatten().fieldErrors
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return errorResponse("UNAUTHORIZED", "이메일 또는 비밀번호를 확인해 주세요.", 401);
  }

  const redirectTo = await getPostAuthRedirectPath(supabase);
  revalidatePath("/", "layout");

  return successResponse({ redirectTo }, 200, {
    message: "로그인했습니다."
  });
}

export const dynamic = "force-dynamic";
