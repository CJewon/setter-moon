import { describe, expect, it } from "@jest/globals";
import { productEditSchema } from "@/features/products/schemas/product-edit-schema";

describe("productEditSchema", () => {
  it("accepts editable product basic fields", () => {
    const parsed = productEditSchema.parse({
      basePrice: "9900",
      memo: "  내부 메모  ",
      name: "  반팔 티셔츠  ",
      status: "active"
    });

    expect(parsed).toEqual({
      basePrice: 9900,
      memo: "내부 메모",
      name: "반팔 티셔츠",
      status: "active"
    });
  });

  it("rejects an empty name and invalid price", () => {
    const parsed = productEditSchema.safeParse({
      basePrice: "-1",
      name: "",
      status: "active"
    });

    expect(parsed.success).toBe(false);
  });
});
