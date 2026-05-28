import { InsufficientStockError } from "@/server/orders/errors";
import type { OrderItemRow, ProductVariantRow } from "@/server/orders/types";

export type StockPlanItem = {
  afterStock: number;
  beforeStock: number;
  item: Pick<OrderItemRow, "product_id" | "quantity" | "variant_id">;
  variant: Pick<ProductVariantRow, "current_stock" | "id">;
};

export function getAvailableStock(currentStock: number, reservedQuantity: number) {
  return Math.max(currentStock - reservedQuantity, 0);
}

export function getStockDeductionPlan(
  items: Pick<OrderItemRow, "product_id" | "quantity" | "variant_id">[],
  variants: Pick<ProductVariantRow, "current_stock" | "id">[]
): StockPlanItem[] {
  return items.map((item) => {
    const variant = variants.find((candidate) => candidate.id === item.variant_id);

    if (!variant || variant.current_stock < item.quantity) {
      throw new InsufficientStockError();
    }

    return {
      afterStock: variant.current_stock - item.quantity,
      beforeStock: variant.current_stock,
      item,
      variant
    };
  });
}

export function getStockRestorePlan(
  items: Pick<OrderItemRow, "product_id" | "quantity" | "variant_id">[],
  variants: Pick<ProductVariantRow, "current_stock" | "id">[]
): StockPlanItem[] {
  return items.map((item) => {
    const variant = variants.find((candidate) => candidate.id === item.variant_id);

    if (!variant) {
      throw new InsufficientStockError("복구할 옵션별 재고를 찾을 수 없습니다.");
    }

    return {
      afterStock: variant.current_stock + item.quantity,
      beforeStock: variant.current_stock,
      item,
      variant
    };
  });
}
