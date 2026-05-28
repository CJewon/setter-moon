"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { signInSchema, signUpSchema } from "@/features/auth/schemas/auth-form-schema";
import { getSignUpAuthErrorState } from "@/features/auth/utils/auth-error";
import { getCurrentStore, isStoreSchemaMissingError } from "@/server/stores/service";
import { hasSupabasePublicEnv, hasSupabaseServerAuthEnv } from "@/shared/lib/env";
import { createAdminClient } from "@/shared/lib/supabase/admin";
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

  try {
    const store = await getCurrentStore(supabase, user.id);

    return store ? "/dashboard" : "/onboarding/store";
  } catch (error) {
    if (isStoreSchemaMissingError(error)) {
      return "/onboarding/store";
    }

    throw error;
  }
}

export async function signInAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return invalidState("입력한 정보를 다시 확인해 주세요.", parsed.error.flatten().fieldErrors);
  }

  if (!hasSupabasePublicEnv()) {
    return invalidState("로그인 연결이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
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
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm")
  });

  if (!parsed.success) {
    return invalidState("입력한 정보를 다시 확인해 주세요.", parsed.error.flatten().fieldErrors);
  }

  if (!hasSupabasePublicEnv() || !hasSupabaseServerAuthEnv()) {
    return invalidState("계정 만들기 연결이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
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
    return getSignUpAuthErrorState(createUserError);
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (signInError) {
    return invalidState("계정은 만들었지만 로그인하지 못했습니다. 로그인 화면에서 다시 시도해 주세요.");
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
  redirect("/");
}
