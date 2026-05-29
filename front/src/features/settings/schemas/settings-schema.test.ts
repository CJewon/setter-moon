import { describe, expect, it } from "@jest/globals";
import { settingsFormSchema } from "@/features/settings/schemas/settings-schema";

describe("settingsFormSchema", () => {
  it("accepts editable store setting fields", () => {
    const result = settingsFormSchema.safeParse({
      storeName: "셀러룸 테스트 스토어",
      businessType: "스마트스토어",
      memo: "초기 운영 메모"
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty store name", () => {
    const result = settingsFormSchema.safeParse({
      storeName: "   ",
      businessType: "",
      memo: ""
    });

    expect(result.success).toBe(false);
  });
});
