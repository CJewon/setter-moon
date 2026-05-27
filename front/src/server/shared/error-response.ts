import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INSUFFICIENT_STOCK"
  | "INVALID_STATUS_TRANSITION"
  | "CONFLICT";

export function errorResponse(code: ApiErrorCode, message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      code,
      message
    },
    { status }
  );
}

type SuccessResponseOptions = {
  headers?: HeadersInit;
};

export function successResponse<T>(data: T, status = 200, options: SuccessResponseOptions = {}) {
  return NextResponse.json(
    {
      ok: true,
      data
    },
    {
      status,
      headers: options.headers
    }
  );
}
