"use client";

import { useMemo, useState } from "react";
import { useProductCreateSubmit } from "@/features/products/hooks/use-product-create-submit";
import type {
  ProductBasicDraft,
  ProductCreateFormState,
  ProductOptionGroupDraft,
  ProductOptionMode,
  ProductVariantDraft
} from "@/features/products/types/product-create-draft";
import {
  createDefaultBasicDraft,
  createDefaultOptionGroup,
  createDefaultVariantDraft,
  createDraftId,
  getUsageMetric
} from "@/features/products/utils/product-create-draft";
import { createVariantCombinationItems, normalizeOptionGroups } from "@/features/products/utils/variant-combinations";
import type { UsageSummary } from "@/server/usage/usage-policy";

const initialState: ProductCreateFormState = { status: "idle", message: "" };

export function useProductCreateDraft(usageSummary: UsageSummary) {
  const [state, setState] = useState<ProductCreateFormState>(initialState);
  const [basic, setBasic] = useState<ProductBasicDraft>(() => createDefaultBasicDraft());
  const [optionMode, setOptionMode] = useState<ProductOptionMode>("none");
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroupDraft[]>(() => [createDefaultOptionGroup()]);
  const [variantDrafts, setVariantDrafts] = useState<Record<string, ProductVariantDraft>>({});
  const normalizedGroups = useMemo(() => normalizeOptionGroups(optionGroups), [optionGroups]);
  const combinations = useMemo(() => {
    if (optionMode === "none") {
      return createVariantCombinationItems([]);
    }

    return normalizedGroups.length > 0 ? createVariantCombinationItems(normalizedGroups) : [];
  }, [normalizedGroups, optionMode]);
  const variants = useMemo(
    () =>
      combinations.map((combination) => {
        const defaultVariant = createDefaultVariantDraft(combination, basic);
        const savedVariant = variantDrafts[combination.key];

        return savedVariant
          ? {
              ...defaultVariant,
              ...savedVariant,
              key: combination.key,
              label: combination.label,
              options: combination.options
            }
          : defaultVariant;
      }),
    [basic, combinations, variantDrafts]
  );
  const activeVariantCount = variants.filter((variant) => variant.isActive).length;
  const productMetric = getUsageMetric(usageSummary, "products");
  const optionCombinationMetric = getUsageMetric(usageSummary, "skus");
  const productLimitReached = productMetric?.limit !== null && productMetric?.state === "blocked";
  const optionCombinationLimit =
    optionCombinationMetric?.limit === null || optionCombinationMetric?.limit === undefined
      ? null
      : optionCombinationMetric.limit - optionCombinationMetric.count;
  const optionCombinationLimitExceeded = optionCombinationLimit !== null && activeVariantCount > optionCombinationLimit;
  const { handleSubmit, pending } = useProductCreateSubmit({
    basic,
    optionCombinationLimitExceeded,
    optionGroups,
    optionMode,
    productLimitReached,
    setState,
    variants
  });

  function updateBasic(field: keyof ProductBasicDraft, value: string) {
    setBasic((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateOptionGroup(groupId: string, value: string) {
    setOptionGroups((current) => current.map((group) => (group.id === groupId ? { ...group, name: value } : group)));
  }

  function updateOptionValue(groupId: string, index: number, value: string) {
    setOptionGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.map((optionValue, optionIndex) => (optionIndex === index ? value : optionValue))
            }
          : group
      )
    );
  }

  function addOptionValue(groupId: string) {
    setOptionGroups((current) =>
      current.map((group) => (group.id === groupId ? { ...group, values: [...group.values, ""] } : group))
    );
  }

  function removeOptionValue(groupId: string, index: number) {
    setOptionGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.filter((_, optionIndex) => optionIndex !== index)
            }
          : group
      )
    );
  }

  function addOptionGroup() {
    setOptionGroups((current) => [...current, { id: createDraftId(), name: "", values: [""] }]);
  }

  function removeOptionGroup(groupId: string) {
    setOptionGroups((current) => current.filter((group) => group.id !== groupId));
  }

  function updateVariant(key: string, patch: Partial<ProductVariantDraft>) {
    setVariantDrafts((current) => {
      const currentVariant = current[key] ?? variants.find((variant) => variant.key === key);

      if (!currentVariant) {
        return current;
      }

      return {
        ...current,
        [key]: {
          ...currentVariant,
          ...patch
        }
      };
    });
  }

  return {
    activeVariantCount,
    addOptionGroup,
    addOptionValue,
    basic,
    handleSubmit,
    optionCombinationLimit,
    optionCombinationLimitExceeded,
    optionCombinationMetric,
    optionGroups,
    optionMode,
    pending,
    productLimitReached,
    productMetric,
    removeOptionGroup,
    removeOptionValue,
    setOptionMode,
    state,
    updateBasic,
    updateOptionGroup,
    updateOptionValue,
    updateVariant,
    variants
  };
}
