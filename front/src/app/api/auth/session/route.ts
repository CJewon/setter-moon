import { getAppAccess, getAppAccessNextPath, getAppAccessPlanId } from "@/server/auth/session";
import { getUserDisplayName } from "@/server/profiles/service";
import { successResponse } from "@/server/shared/error-response";

type SafeUserProfile = {
  id: string;
  email: string | null;
  name: string | null;
};

type SafePlanProfile = {
  id: "free" | "paid_full";
  status: "active" | "past_due" | "cancelled" | null;
  currentPeriodEnd: string | null;
  isPaid: boolean;
};

function toSafeUserProfile(access: Awaited<ReturnType<typeof getAppAccess>>): SafeUserProfile | null {
  if (!access.isSupabaseConfigured || !access.user) {
    return null;
  }

  const user = access.user;

  return {
    id: user.id,
    email: user.email ?? access.profile?.email ?? null,
    name: getUserDisplayName(user, access.profile)
  };
}

function toSafePlanProfile(access: Awaited<ReturnType<typeof getAppAccess>>): SafePlanProfile {
  const planId = getAppAccessPlanId(access);

  if (!access.isSupabaseConfigured) {
    return {
      id: planId,
      status: null,
      currentPeriodEnd: null,
      isPaid: false
    };
  }

  return {
    id: planId,
    status: access.profile?.plan_status ?? null,
    currentPeriodEnd: access.profile?.plan_current_period_end ?? null,
    isPaid: planId === "paid_full"
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
      user: toSafeUserProfile(access),
      plan: toSafePlanProfile(access)
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
