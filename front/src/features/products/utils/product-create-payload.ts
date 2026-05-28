import type { ProductCreateValues } from "@/features/products/schemas/product-form-schema";
import type {
  ProductBasicDraft,
  ProductOptionGroupDraft,
  ProductOptionMode,
  ProductVariantDraft
} from "@/features/products/types/product-create-draft";
import { normalizeOptionGroups } from "@/features/products/utils/variant-combinations";

export function toProductNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0;
}

export function createProductPayload(
  basic: ProductBasicDraft,
  optionMode: ProductOptionMode,
  optionGroups: ProductOptionGroupDraft[],
  variants: ProductVariantDraft[]
): ProductCreateValues {
  return {
    name: basic.name,
    basePrice: toProductNumber(basic.basePrice),
    baseCost: toProductNumber(basic.baseCost),
    status: basic.status,
    memo: basic.memo,
    optionMode,
    optionGroups:
      optionMode === "options"
        ? normalizeOptionGroups(optionGroups).map((group) => ({
            name: group.name,
            values: group.values
          }))
        : [],
    variants: variants.map((variant) => ({
      clientKey: variant.key,
      options: optionMode === "options" ? variant.options : [],
      isActive: variant.isActive,
      price: toProductNumber(variant.price || basic.basePrice),
      cost: toProductNumber(variant.cost || basic.baseCost),
      currentStock: toProductNumber(variant.currentStock),
      safetyStock: toProductNumber(variant.safetyStock),
      memo: variant.memo
    }))
  };
}
