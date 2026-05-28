export type ApiErrorShape = {
  code: 400 | 401 | 403 | 404 | 409 | 429 | 500;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ApiSuccessShape<T> = {
  code: 200;
  message: string;
  data: T;
};

export type ApiResult<T> = ApiSuccessShape<T> | ApiErrorShape;

export class ApiRequestError extends Error {
  code: number;
  fieldErrors?: Record<string, string[] | undefined>;
  status: number;

  constructor(message: string, code: number, status: number, fieldErrors?: Record<string, string[] | undefined>) {
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
    throw new ApiRequestError("요청 결과를 확인하지 못했습니다.", response.status || 500, response.status || 500);
  }

  if (payload.code !== 200) {
    throw new ApiRequestError(payload.message, payload.code, response.status, payload.fieldErrors);
  }

  if (!response.ok) {
    throw new ApiRequestError(payload.message, response.status || 500, response.status || 500);
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
