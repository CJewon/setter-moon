import type { User } from "@supabase/supabase-js";
import { getAppAccess, getAppAccessNextPath } from "@/server/auth/session";
import { successResponse } from "@/server/shared/error-response";

type SafeUserProfile = {
  id: string;
  email: string | null;
  name: string | null;
};

function getStringMetadata(user: User, key: string) {
  const value = user.user_metadata?.[key];

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toSafeUserProfile(user: User | null): SafeUserProfile | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: getStringMetadata(user, "name")
  };
}

export async function GET() {
  const access = await getAppAccess();

  return successResponse(
    {
      isSupabaseConfigured: access.isSupabaseConfigured,
      isAuthenticated: Boolean(access.user),
      hasStore: Boolean(access.store),
      nextPath: getAppAccessNextPath(access),
      user: toSafeUserProfile(access.user)
    },
    200,
    {
      headers: {
        "Cache-Control": "private, no-store"
      }
    }
  );
}

export const dynamic = "force-dynamic";
