"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useCreateProductMutation } from "@/features/products/hooks/use-product-mutations";
import { productCreateSchema } from "@/features/products/schemas/product-form-schema";
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
import { createProductPayload } from "@/features/products/utils/product-create-payload";
import { createVariantCombinationItems, normalizeOptionGroups } from "@/features/products/utils/variant-combinations";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import type { UsageSummary } from "@/server/usage/usage-policy";

const initialState: ProductCreateFormState = { status: "idle", message: "" };

export function useProductCreateDraft(usageSummary: UsageSummary) {
  const router = useRouter();
  const { showToast } = useToast();
  const createProductMutation = useCreateProductMutation();
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
  const pending = createProductMutation.isPending;

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = createProductPayload(basic, optionMode, optionGroups, variants);
    const parsed = productCreateSchema.safeParse(payload);

    if (!parsed.success) {
      const nextState = {
        status: "error" as const,
        message: "상품 정보를 다시 확인해 주세요.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };

      setState(nextState);
      showToast({ tone: "error", title: "확인 필요", message: nextState.message });
      return;
    }

    if (productLimitReached) {
      const message = "무료 플랜 상품 한도 10개를 모두 사용했어요.";
      setState({ status: "error", message });
      showToast({ tone: "error", title: "상품 한도 도달", message });
      return;
    }

    if (optionCombinationLimitExceeded) {
      const message = "무료 플랜 옵션 조합 한도를 초과합니다. 사용하지 않을 조합을 제외해 주세요.";
      setState({ status: "error", message });
      showToast({ tone: "error", title: "옵션 조합 한도 초과", message });
      return;
    }

    setState(initialState);
    createProductMutation.mutate(parsed.data, {
      onSuccess: ({ data, message }) => {
        showToast({
          tone: "success",
          title: "등록 완료",
          message
        });
        router.push(`/products/${data.productId}`);
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "상품을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "등록 실패",
          message: nextState.message
        });
      }
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
