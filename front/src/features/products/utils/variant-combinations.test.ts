import { describe, expect, it } from "@jest/globals";
import { createVariantCombinations } from "@/features/products/utils/variant-combinations";

describe("createVariantCombinations", () => {
  it("creates a default SKU when no options exist", () => {
    expect(createVariantCombinations([])).toEqual([["기본"]]);
  });

  it("creates cartesian combinations for option groups", () => {
    expect(
      createVariantCombinations([
        { name: "색상", values: ["블랙", "화이트"] },
        { name: "사이즈", values: ["M", "L"] }
      ])
    ).toEqual([
      ["블랙", "M"],
      ["블랙", "L"],
      ["화이트", "M"],
      ["화이트", "L"]
    ]);
  });
});
