"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { signInSchema, signUpSchema } from "@/features/auth/schemas/auth-form-schema";
import { getCurrentStore } from "@/server/stores/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";
import type { ActionState } from "@/shared/types/action-state";
import type { Database } from "@/shared/types/database";

function invalidState(message: string, fieldErrors?: ActionState["fieldErrors"]): ActionState {
  return {
    status: "error",
    message,
    fieldErrors
  };
}

async function getPostAuthRedirectPath(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return "/sign-in";
  }

  const store = await getCurrentStore(supabase, user.id);

  return store ? "/dashboard" : "/onboarding/store";
}

export async function signInAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabasePublicEnv()) {
    return invalidState("Supabase 환경 변수를 먼저 설정해야 합니다.");
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return invalidState("입력 정보를 확인해 주세요.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return invalidState("이메일 또는 비밀번호를 확인해 주세요.");
  }

  const redirectPath = await getPostAuthRedirectPath(supabase);
  revalidatePath("/", "layout");
  redirect(redirectPath);
}

export async function signUpAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabasePublicEnv()) {
    return invalidState("Supabase 환경 변수를 먼저 설정해야 합니다.");
  }

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm")
  });

  if (!parsed.success) {
    return invalidState("입력 정보를 확인해 주세요.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name
      }
    }
  });

  if (error) {
    return invalidState("계정을 만들 수 없습니다. 입력 정보를 확인한 뒤 다시 시도해 주세요.");
  }

  if (!data.session) {
    return {
      status: "success",
      message: "가입 확인 메일을 보냈습니다. 이메일 확인 후 로그인해 주세요."
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding/store");
}

export async function signOutAction() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/sign-in");
}
