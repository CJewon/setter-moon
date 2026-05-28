"use client";

import { useRouter } from "next/navigation";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useCreateProductMutation } from "@/features/products/hooks/use-product-mutations";
import { productCreateSchema } from "@/features/products/schemas/product-form-schema";
import type {
  ProductBasicDraft,
  ProductCreateFormState,
  ProductOptionGroupDraft,
  ProductOptionMode,
  ProductVariantDraft
} from "@/features/products/types/product-create-draft";
import { createProductPayload } from "@/features/products/utils/product-create-payload";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";

type UseProductCreateSubmitParams = {
  basic: ProductBasicDraft;
  optionCombinationLimitExceeded: boolean;
  optionGroups: ProductOptionGroupDraft[];
  optionMode: ProductOptionMode;
  productLimitReached: boolean;
  setState: Dispatch<SetStateAction<ProductCreateFormState>>;
  variants: ProductVariantDraft[];
};

const initialState: ProductCreateFormState = { status: "idle", message: "" };

export function useProductCreateSubmit({
  basic,
  optionCombinationLimitExceeded,
  optionGroups,
  optionMode,
  productLimitReached,
  setState,
  variants
}: UseProductCreateSubmitParams) {
  const router = useRouter();
  const { showToast } = useToast();
  const createProductMutation = useCreateProductMutation();

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
    handleSubmit,
    pending: createProductMutation.isPending
  };
}
