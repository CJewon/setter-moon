import { describe, expect, it } from "@jest/globals";
import { myPageFormSchema } from "@/features/my-page/schemas/my-page-schema";

describe("myPageFormSchema", () => {
  it("accepts editable account and store fields", () => {
    const result = myPageFormSchema.safeParse({
      displayName: "김셀러",
      storeName: "셀러룸 테스트 스토어",
      businessType: "스마트스토어",
      memo: "초기 운영 메모"
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty store name", () => {
    const result = myPageFormSchema.safeParse({
      displayName: "김셀러",
      storeName: "   ",
      businessType: "",
      memo: ""
    });

    expect(result.success).toBe(false);
  });
});
