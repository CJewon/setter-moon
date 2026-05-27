import { errorResponse } from "@/server/shared/error-response";
import { createClient } from "@/shared/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      response: errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401)
    };
  }

  return {
    user,
    response: null
  };
}
