import type { ProductCreateValues, ProductVariantValues } from "@/features/products/schemas/product-form-schema";

type ProductOptionValidationInput = Pick<ProductCreateValues, "optionMode" | "optionGroups" | "variants">;

function getActiveVariants(values: ProductOptionValidationInput) {
  return values.variants.filter((variant) => variant.isActive);
}

function getVariantLabel(variant: ProductVariantValues) {
  return variant.options.length > 0 ? variant.options.map((option) => option.value).join(" / ") : "기본";
}

export function getActiveVariantOptionMismatch(values: ProductOptionValidationInput) {
  const activeVariants = getActiveVariants(values);

  if (values.optionMode === "none") {
    const variantWithOptions = activeVariants.find((variant) => variant.options.length > 0);

    return variantWithOptions ? "옵션 없음 상품의 활성 옵션 조합에는 옵션값을 보낼 수 없습니다." : null;
  }

  const expectedGroupNames = values.optionGroups.map((group) => group.name);
  const expectedGroupNameSet = new Set(expectedGroupNames);
  const optionValuesByGroup = new Map(values.optionGroups.map((group) => [group.name, new Set(group.values)]));

  for (const variant of activeVariants) {
    if (variant.options.length !== expectedGroupNames.length) {
      return `${getVariantLabel(variant)} 조합의 옵션 개수가 옵션 그룹과 맞지 않습니다.`;
    }

    const seenGroupNames = new Set<string>();

    for (const option of variant.options) {
      if (!expectedGroupNameSet.has(option.groupName)) {
        return `${getVariantLabel(variant)} 조합에 등록되지 않은 옵션 그룹이 포함되어 있습니다.`;
      }

      if (seenGroupNames.has(option.groupName)) {
        return `${getVariantLabel(variant)} 조합에 같은 옵션 그룹이 중복되어 있습니다.`;
      }

      seenGroupNames.add(option.groupName);

      if (!optionValuesByGroup.get(option.groupName)?.has(option.value)) {
        return `${getVariantLabel(variant)} 조합에 등록되지 않은 옵션값이 포함되어 있습니다.`;
      }
    }

    for (const groupName of expectedGroupNames) {
      if (!seenGroupNames.has(groupName)) {
        return `${getVariantLabel(variant)} 조합에 ${groupName} 옵션이 없습니다.`;
      }
    }
  }

  return null;
}
