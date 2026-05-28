import type { ActionState } from "@/shared/types/action-state";

type SupabaseAuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

type AuthApiError = {
  code: 400 | 409 | 429 | 500;
  message: string;
  fieldErrors?: ActionState["fieldErrors"];
};

function hasMessage(error: SupabaseAuthErrorLike, text: string) {
  return error.message?.toLowerCase().includes(text.toLowerCase()) ?? false;
}

function errorState(message: string, fieldErrors?: ActionState["fieldErrors"]): ActionState {
  return {
    status: "error",
    message,
    fieldErrors
  };
}

export function getSignUpAuthApiError(error: SupabaseAuthErrorLike): AuthApiError {
  if (
    error.code === "email_exists" ||
    error.code === "user_already_exists" ||
    hasMessage(error, "user already registered") ||
    hasMessage(error, "already been registered")
  ) {
    return {
      code: 409,
      message: "이미 가입된 이메일입니다. 로그인해 주세요.",
      fieldErrors: {
        email: ["이미 가입된 이메일입니다."]
      }
    };
  }

  if (
    error.code === "over_email_send_rate_limit" ||
    error.status === 429 ||
    hasMessage(error, "email rate limit")
  ) {
    return {
      code: 429,
      message: "가입 요청이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.",
      fieldErrors: {
        email: ["잠시 후 다시 시도해 주세요."]
      }
    };
  }

  if (error.code === "email_address_invalid" || hasMessage(error, "email address") || hasMessage(error, "invalid email")) {
    return {
      code: 400,
      message: "사용할 수 없는 이메일입니다. 다른 이메일을 입력해 주세요.",
      fieldErrors: {
        email: ["사용할 수 없는 이메일입니다."]
      }
    };
  }

  return {
    code: 500,
    message: "계정을 만들 수 없습니다. 입력 정보를 확인한 뒤 다시 시도해 주세요."
  };
}

export function getSignUpAuthErrorState(error: SupabaseAuthErrorLike): ActionState {
  const apiError = getSignUpAuthApiError(error);

  return errorState(apiError.message, apiError.fieldErrors);
}
