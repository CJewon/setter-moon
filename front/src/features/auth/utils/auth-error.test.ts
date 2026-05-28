import { describe, expect, it } from "@jest/globals";
import { getSignUpAuthErrorState } from "@/features/auth/utils/auth-error";

describe("auth error mapping", () => {
  it("maps duplicated email errors from the admin API to an email field error", () => {
    expect(getSignUpAuthErrorState({ code: "email_exists" })).toEqual({
      status: "error",
      message: "이미 가입된 이메일입니다. 로그인해 주세요.",
      fieldErrors: {
        email: ["이미 가입된 이메일입니다."]
      }
    });
  });

  it("maps Supabase email send rate limits to a retry message", () => {
    expect(getSignUpAuthErrorState({ code: "over_email_send_rate_limit", status: 429 })).toEqual({
      status: "error",
      message: "가입 요청이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.",
      fieldErrors: {
        email: ["잠시 후 다시 시도해 주세요."]
      }
    });
  });

  it("maps invalid email errors to an email field error", () => {
    expect(getSignUpAuthErrorState({ message: 'Email address "test@gmail.com" is invalid' })).toEqual({
      status: "error",
      message: "사용할 수 없는 이메일입니다. 다른 이메일을 입력해 주세요.",
      fieldErrors: {
        email: ["사용할 수 없는 이메일입니다."]
      }
    });
  });
});
