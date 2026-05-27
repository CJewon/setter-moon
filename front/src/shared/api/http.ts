export type ApiErrorShape = {
  ok: false;
  code: string;
  message: string;
};

export type ApiSuccessShape<T> = {
  ok: true;
  data: T;
};

export type ApiResult<T> = ApiSuccessShape<T> | ApiErrorShape;

export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResult<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  const payload = (await response.json()) as ApiResult<T>;

  return payload;
}
