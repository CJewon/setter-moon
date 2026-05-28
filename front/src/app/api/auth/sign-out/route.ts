import { revalidatePath } from "next/cache";
import { successResponse, withApiErrorBoundary } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiErrorBoundary(async () => {
  if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  return successResponse({ redirectTo: "/" }, {
    message: "로그아웃했습니다."
  });
});

export const dynamic = "force-dynamic";
