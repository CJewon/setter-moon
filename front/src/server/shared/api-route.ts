import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { z } from "zod";
import { errorResponse } from "@/server/shared/error-response";
import type { Database } from "@/shared/types/database";
import type { PaginationParams } from "@/shared/types/pagination";

export type ApiRouteResult<T> =
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

export function parsePaginationSearchParams(
  request: Request,
  {
    defaultPageSize,
    pageSizeOptions
  }: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  }
): ApiRouteResult<PaginationParams> {
  const searchParams = new URL(request.url).searchParams;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const page = pageParam ? Number(pageParam) : 1;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : defaultPageSize;

  if (!Number.isInteger(page) || page < 1) {
    return {
      ok: false,
      response: errorResponse(400, "페이지 번호를 확인해 주세요.")
    };
  }

  if (!Number.isInteger(pageSize) || !pageSizeOptions.includes(pageSize)) {
    return {
      ok: false,
      response: errorResponse(400, `페이지 크기는 ${pageSizeOptions.join(", ")} 중 하나여야 합니다.`)
    };
  }

  return {
    ok: true,
    data: {
      page,
      pageSize
    }
  };
}

export function getOptionalSearchParam(searchParams: URLSearchParams, name: string) {
  const value = searchParams.get(name)?.trim();

  return value ? value : undefined;
}
