import { describe, expect, it } from "@jest/globals";
import { myPageAccountSchema } from "@/features/my-page/schemas/my-page-schema";

describe("myPageAccountSchema", () => {
  it("accepts editable account fields", () => {
    const result = myPageAccountSchema.safeParse({
      displayName: "김셀러"
    });

    expect(result.success).toBe(true);
  });

  it("rejects a too long display name", () => {
    const result = myPageAccountSchema.safeParse({
      displayName: "가".repeat(41)
    });

    expect(result.success).toBe(false);
  });
});
