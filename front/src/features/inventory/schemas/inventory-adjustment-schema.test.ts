import { describe, expect, it } from "@jest/globals";
import { inventoryAdjustmentSchema } from "@/features/inventory/schemas/inventory-adjustment-schema";

describe("inventory adjustment schema", () => {
  it("accepts a valid manual stock adjustment", () => {
    expect(
      inventoryAdjustmentSchema.parse({
        memo: "실사 재고 반영",
        targetStock: "4",
        variantId: "7e604de0-3b82-4174-a1ef-7c5a5ca9a681"
      })
    ).toMatchObject({
      memo: "실사 재고 반영",
      targetStock: 4,
      variantId: "7e604de0-3b82-4174-a1ef-7c5a5ca9a681"
    });
  });

  it("rejects missing memo and negative stock", () => {
    const parsed = inventoryAdjustmentSchema.safeParse({
      memo: "",
      targetStock: "-1",
      variantId: "not-a-uuid"
    });

    expect(parsed.success).toBe(false);
  });
});
