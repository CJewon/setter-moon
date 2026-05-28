import { revalidatePath } from "next/cache";
import { successResponse } from "@/server/shared/error-response";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export async function POST() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  return successResponse({ redirectTo: "/" }, 200, {
    message: "로그아웃했습니다."
  });
}

export const dynamic = "force-dynamic";
