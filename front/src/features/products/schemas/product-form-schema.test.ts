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

  it("rejects duplicated option group names", () => {
    const parsed = productCreateSchema.safeParse({
      ...basePayload,
      optionMode: "options",
      optionGroups: [
        { name: "색상", values: ["블랙"] },
        { name: "색상", values: ["화이트"] }
      ],
      variants: [
        {
          ...basePayload.variants[0],
          clientKey: "black",
          options: [{ groupName: "색상", value: "블랙" }]
        }
      ]
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.optionGroups).toContain("이미 추가한 옵션 그룹명입니다.");
    }
  });

  it("rejects more than 100 option combinations", () => {
    const variants = Array.from({ length: 101 }, (_, index) => ({
      ...basePayload.variants[0],
      clientKey: `variant-${index}`,
      options: [{ groupName: "색상", value: `색상-${index}` }]
    }));

    const parsed = productCreateSchema.safeParse({
      ...basePayload,
      optionMode: "options",
      optionGroups: [{ name: "색상", values: variants.map((variant) => variant.options[0].value) }],
      variants
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.variants).toContain("한 번에 등록할 옵션 조합은 100개 이하입니다.");
    }
  });

  it("rejects active variants that do not match every option group", () => {
    const parsed = productCreateSchema.safeParse({
      ...basePayload,
      optionMode: "options",
      optionGroups: [
        { name: "색상", values: ["블랙"] },
        { name: "사이즈", values: ["M"] }
      ],
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

  it("rejects active variants with unknown option values", () => {
    const parsed = productCreateSchema.safeParse({
      ...basePayload,
      optionMode: "options",
      optionGroups: [{ name: "색상", values: ["블랙"] }],
      variants: [
        {
          ...basePayload.variants[0],
          clientKey: "white",
          options: [{ groupName: "색상", value: "화이트" }]
        }
      ]
    });

    expect(parsed.success).toBe(false);
  });
});
