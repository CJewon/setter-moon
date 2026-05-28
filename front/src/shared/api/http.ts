export type ApiErrorShape = {
  ok: false;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ApiSuccessShape<T> = {
  ok: true;
  data: T;
  message?: string;
};

export type ApiResult<T> = ApiSuccessShape<T> | ApiErrorShape;

export class ApiRequestError extends Error {
  code: string;
  fieldErrors?: Record<string, string[] | undefined>;
  status: number;

  constructor(message: string, code: string, status: number, fieldErrors?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiSuccessShape<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  const payload = (await response.json().catch(() => null)) as ApiResult<T> | null;

  if (!payload) {
    throw new ApiRequestError("서버 응답을 확인하지 못했습니다.", "INVALID_RESPONSE", response.status);
  }

  if (!payload.ok) {
    throw new ApiRequestError(payload.message, payload.code, response.status, payload.fieldErrors);
  }

  return payload;
}

export function getApiErrorState(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiRequestError) {
    return {
      status: "error" as const,
      message: error.message,
      fieldErrors: error.fieldErrors
    };
  }

  return {
    status: "error" as const,
    message: fallbackMessage
  };
}
