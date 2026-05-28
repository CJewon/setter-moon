import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { z } from "zod";
import { errorResponse } from "@/server/shared/error-response";
import type { Database } from "@/shared/types/database";

type ApiRouteResult<T> =
  | {
      data: T;
      ok: true;
    }
  | {
      ok: false;
      response: Response;
    };

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  errorMessage: string
): Promise<ApiRouteResult<z.infer<TSchema>>> {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      response: errorResponse(400, errorMessage, {
        fieldErrors: parsed.error.flatten().fieldErrors
      })
    };
  }

  return {
    ok: true,
    data: parsed.data
  };
}

export async function requireApiUser(supabase: SupabaseClient<Database>): Promise<ApiRouteResult<User>> {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: errorResponse(401, "로그인이 필요합니다.")
    };
  }

  return {
    ok: true,
    data: user
  };
}
