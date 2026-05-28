import { describe, expect, it } from "@jest/globals";
import { productCreateSchema } from "@/features/products/schemas/product-form-schema";

const basePayload = {
  name: "린넨 셔츠",
  basePrice: 29000,
  baseCost: 12000,
  status: "active" as const,
  memo: "",
  optionMode: "none" as const,
  optionGroups: [],
  variants: [
    {
      clientKey: "default",
      options: [],
      isActive: true,
      price: 29000,
      cost: 12000,
      currentStock: 5,
      safetyStock: 1,
      memo: ""
    }
  ]
};

describe("productCreateSchema", () => {
  it("accepts a product without options", () => {
    expect(productCreateSchema.safeParse(basePayload).success).toBe(true);
  });

  it("requires at least one active option combination", () => {
    const parsed = productCreateSchema.safeParse({
      ...basePayload,
      variants: [{ ...basePayload.variants[0], isActive: false }]
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects duplicated option values in a group", () => {
    const parsed = productCreateSchema.safeParse({
      ...basePayload,
      optionMode: "options",
      optionGroups: [{ name: "색상", values: ["블랙", "블랙"] }],
      variants: [
        {
          ...basePayload.variants[0],
          clientKey: "black",
          options: [{ groupName: "색상", value: "블랙" }]
        }
      ]
    });

    expect(parsed.success).toBe(false);
  });
});
