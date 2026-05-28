import { describe, expect, it } from "@jest/globals";
import {
  findIdSchema,
  forgotPasswordSchema,
  signInSchema,
  signUpSchema
} from "@/features/auth/schemas/auth-form-schema";

describe("auth form schemas", () => {
  it("accepts a valid sign-in payload", () => {
    expect(
      signInSchema.safeParse({
        email: "seller@example.com",
        password: "password"
      }).success
    ).toBe(true);
  });

  it("rejects mismatched sign-up passwords", () => {
    const result = signUpSchema.safeParse({
      name: "김셀러",
      email: "seller@example.com",
      password: "password123",
      passwordConfirm: "password456"
    });

    expect(result.success).toBe(false);
  });

  it("rejects sign-up passwords without a letter and number", () => {
    expect(
      signUpSchema.safeParse({
        name: "김셀러",
        email: "seller@example.com",
        password: "password",
        passwordConfirm: "password"
      }).success
    ).toBe(false);

    expect(
      signUpSchema.safeParse({
        name: "김셀러",
        email: "seller@example.com",
        password: "12345678",
        passwordConfirm: "12345678"
      }).success
    ).toBe(false);
  });

  it("accepts minimal sign-up profile data", () => {
    expect(
      signUpSchema.safeParse({
        name: "김셀러",
        email: "seller@example.com",
        password: "password123",
        passwordConfirm: "password123"
      }).success
    ).toBe(true);
  });

  it("validates account recovery forms", () => {
    expect(
      findIdSchema.safeParse({
        name: "김셀러",
        storeName: "셀러룸 테스트 스토어"
      }).success
    ).toBe(true);

    expect(
      forgotPasswordSchema.safeParse({
        email: "seller@example.com"
      }).success
    ).toBe(true);
  });

  it("rejects incomplete account recovery forms", () => {
    expect(
      findIdSchema.safeParse({
        name: "",
        storeName: "셀러룸 테스트 스토어"
      }).success
    ).toBe(false);

    expect(
      forgotPasswordSchema.safeParse({
        email: "seller"
      }).success
    ).toBe(false);
  });
});
