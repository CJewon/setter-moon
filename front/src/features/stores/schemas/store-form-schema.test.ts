import { describe, expect, it } from "@jest/globals";
import { storeFormSchema } from "@/features/stores/schemas/store-form-schema";

describe("store form schema", () => {
  it("trims and accepts a valid store name", () => {
    const result = storeFormSchema.safeParse({
      name: "  무드웨어  ",
      businessType: "스마트스토어",
      memo: "초기 스토어"
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.name : "").toBe("무드웨어");
  });

  it("rejects an empty store name", () => {
    const result = storeFormSchema.safeParse({
      name: "   ",
      businessType: ""
    });

    expect(result.success).toBe(false);
  });
});
