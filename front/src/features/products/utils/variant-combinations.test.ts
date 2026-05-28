import { describe, expect, it } from "@jest/globals";
import {
  createVariantCombinationItems,
  createVariantCombinations,
  normalizeOptionGroups
} from "@/features/products/utils/variant-combinations";

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

  it("normalizes empty and duplicate option values", () => {
    expect(normalizeOptionGroups([{ name: " 색상 ", values: ["블랙", "블랙", " "] }])).toEqual([
      { name: "색상", values: ["블랙"] }
    ]);
  });

  it("creates labeled option combination items", () => {
    expect(
      createVariantCombinationItems([
        { name: "색상", values: ["블랙"] },
        { name: "사이즈", values: ["M"] }
      ])
    ).toEqual([
      {
        key: "색상:블랙|사이즈:M",
        label: "블랙 / M",
        options: [
          { groupName: "색상", value: "블랙" },
          { groupName: "사이즈", value: "M" }
        ]
      }
    ]);
  });
});
