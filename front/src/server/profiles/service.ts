import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

type ProfileSupabaseClient = SupabaseClient<Database>;

export class ProfileSchemaMissingError extends Error {
  constructor(message = "Supabase profiles table is not ready.") {
    super(message);
    this.name = "ProfileSchemaMissingError";
  }
}

export function isProfileSchemaMissingError(error: unknown) {
  return error instanceof ProfileSchemaMissingError;
}

function isMissingProfilesTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (message.includes("could not find the table") && message.includes("public.profiles")) ||
    (message.includes("relation") && message.includes("profiles") && message.includes("does not exist"))
  );
}

export async function getUserProfile(supabase: ProfileSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, plan_id, plan_status, plan_current_period_end, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingProfilesTableError(error)) {
      throw new ProfileSchemaMissingError(error.message);
    }

    throw new Error(error.message);
  }

  return data;
}

export function getEffectiveProfilePlanId(profile: UserProfile | null | undefined) {
  if (!profile) {
    return null;
  }

  if (profile.plan_id !== "paid_full" || profile.plan_status !== "active") {
    return "free";
  }

  if (profile.plan_current_period_end && new Date(profile.plan_current_period_end).getTime() <= Date.now()) {
    return "free";
  }

  return "paid_full";
}

export function getUserDisplayName(user: User, profile: UserProfile | null | undefined) {
  if (profile?.display_name) {
    return profile.display_name;
  }

  const name = user.user_metadata?.name;

  return typeof name === "string" && name.trim().length > 0 ? name.trim() : null;
}
