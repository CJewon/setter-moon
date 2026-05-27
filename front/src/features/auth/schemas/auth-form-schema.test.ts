import { describe, expect, it } from "@jest/globals";
import { signInSchema, signUpSchema } from "@/features/auth/schemas/auth-form-schema";

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
      name: "셀러",
      email: "seller@example.com",
      password: "password123",
      passwordConfirm: "password456"
    });

    expect(result.success).toBe(false);
  });
});
