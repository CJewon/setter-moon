import type {
  ProductBasicDraft,
  ProductOptionGroupDraft,
  ProductVariantDraft
} from "@/features/products/types/product-create-draft";
import type { VariantCombinationItem } from "@/features/products/utils/variant-combinations";
import type { UsageSummary } from "@/server/usage/usage-policy";

export const productStatuses: ProductBasicDraft["status"][] = ["active", "sold_out", "hidden"];

export function createDraftId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function createDefaultOptionGroup(): ProductOptionGroupDraft {
  return {
    id: createDraftId(),
    name: "색상",
    values: ["블랙", "아이보리"]
  };
}

export function createDefaultBasicDraft(): ProductBasicDraft {
  return {
    name: "",
    basePrice: "0",
    baseCost: "0",
    status: "active",
    memo: ""
  };
}

export function createDefaultVariantDraft(
  combination: VariantCombinationItem,
  basic: ProductBasicDraft
): ProductVariantDraft {
  return {
    key: combination.key,
    label: combination.label,
    options: combination.options,
    isActive: true,
    price: basic.basePrice || "0",
    cost: basic.baseCost || "0",
    currentStock: "0",
    safetyStock: "0",
    memo: ""
  };
}

export function getUsageMetric(summary: UsageSummary, key: "products" | "skus") {
  return summary.metrics.find((metric) => metric.key === key);
}
