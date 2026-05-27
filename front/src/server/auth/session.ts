import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  getEffectiveProfilePlanId,
  getUserProfile,
  isProfileSchemaMissingError,
  type UserProfile
} from "@/server/profiles/service";
import { getCurrentStore, isStoreSchemaMissingError, type Store } from "@/server/stores/service";
import { hasSupabasePublicEnv } from "@/shared/lib/env";
import { createClient } from "@/shared/lib/supabase/server";

export type AppAccess =
  | {
      isSupabaseConfigured: false;
      user: null;
      profile: null;
      store: null;
    }
  | {
      isSupabaseConfigured: true;
      user: User | null;
      profile: UserProfile | null;
      store: Store | null;
    };

export function getAppAccessNextPath(access: AppAccess) {
  if (!access.isSupabaseConfigured || !access.user) {
    return "/sign-in";
  }

  return access.store ? "/dashboard" : "/onboarding/store";
}

export async function getAppAccess(): Promise<AppAccess> {
  if (!hasSupabasePublicEnv()) {
    return {
      isSupabaseConfigured: false,
      user: null,
      profile: null,
      store: null
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isSupabaseConfigured: true,
      user: null,
      profile: null,
      store: null
    };
  }

  try {
    const profile = await getUserProfile(supabase, user.id);
    const store = await getCurrentStore(supabase, user.id);

    return {
      isSupabaseConfigured: true,
      user,
      profile,
      store
    };
  } catch (error) {
    if (isProfileSchemaMissingError(error) || isStoreSchemaMissingError(error)) {
      return {
        isSupabaseConfigured: true,
        user,
        profile: null,
        store: null
      };
    }

    throw error;
  }
}

export async function requireDashboardAccess() {
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured) {
    redirect("/sign-in");
  }

  if (!access.user) {
    redirect("/sign-in");
  }

  if (!access.store) {
    redirect("/onboarding/store");
  }

  return access;
}

export function getAppAccessPlanId(access: AppAccess) {
  if (!access.isSupabaseConfigured) {
    return "free";
  }

  return getEffectiveProfilePlanId(access.profile) ?? access.store?.plan_id ?? "free";
}

export async function requireOnboardingAccess() {
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured) {
    redirect("/sign-in");
  }

  if (!access.user) {
    redirect("/sign-in");
  }

  if (access.store) {
    redirect("/dashboard");
  }

  return access;
}

export async function redirectAuthenticatedUser() {
  const access = await getAppAccess();

  if (!access.isSupabaseConfigured || !access.user) {
    return;
  }

  redirect(getAppAccessNextPath(access));
}
