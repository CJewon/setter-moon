import { NextResponse } from "next/server";

export type ApiStatusCode = 200 | 400 | 401 | 403 | 404 | 409 | 429 | 500;

type ErrorResponseOptions = {
  fieldErrors?: Record<string, string[] | undefined>;
};

export function errorResponse(code: Exclude<ApiStatusCode, 200>, message: string, options: ErrorResponseOptions = {}) {
  return NextResponse.json(
    {
      code,
      message,
      ...(options.fieldErrors ? { fieldErrors: options.fieldErrors } : {})
    },
    { status: code }
  );
}

type SuccessResponseOptions = {
  headers?: HeadersInit;
  message?: string;
};

export function successResponse<T>(data: T, options: SuccessResponseOptions = {}) {
  return NextResponse.json(
    {
      code: 200,
      message: options.message ?? "요청이 완료되었습니다.",
      data
    },
    {
      status: 200,
      headers: options.headers
    }
  );
}

export function withApiErrorBoundary<Args extends unknown[]>(handler: (...args: Args) => Promise<Response> | Response) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("Unhandled API error", error);

      return errorResponse(500, "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };
}
