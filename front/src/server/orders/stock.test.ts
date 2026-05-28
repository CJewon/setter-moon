import { describe, expect, it } from "@jest/globals";
import { InsufficientStockError } from "@/server/orders/errors";
import { getAvailableStock, getStockDeductionPlan, getStockRestorePlan } from "@/server/orders/stock";

const items = [
  {
    product_id: "product-1",
    quantity: 3,
    variant_id: "variant-1"
  }
];

describe("order stock helpers", () => {
  it("calculates available stock from current stock and reserved quantity", () => {
    expect(getAvailableStock(10, 3)).toBe(7);
    expect(getAvailableStock(2, 5)).toBe(0);
  });

  it("creates a stock deduction plan without mutating stock directly", () => {
    expect(getStockDeductionPlan(items, [{ current_stock: 5, id: "variant-1" }])).toEqual([
      {
        afterStock: 2,
        beforeStock: 5,
        item: items[0],
        variant: { current_stock: 5, id: "variant-1" }
      }
    ]);
  });

  it("blocks stock deduction when current stock is insufficient", () => {
    expect(() => getStockDeductionPlan(items, [{ current_stock: 2, id: "variant-1" }])).toThrow(InsufficientStockError);
  });

  it("creates a stock restore plan for cancelled ready-to-ship orders", () => {
    expect(getStockRestorePlan(items, [{ current_stock: 2, id: "variant-1" }])).toEqual([
      {
        afterStock: 5,
        beforeStock: 2,
        item: items[0],
        variant: { current_stock: 2, id: "variant-1" }
      }
    ]);
  });
});
