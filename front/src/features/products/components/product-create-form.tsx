"use client";

import type { UsageSummary } from "@/server/usage/usage-policy";
import { ProductBasicSection } from "@/features/products/components/product-basic-section";
import { ProductCreateProgress } from "@/features/products/components/product-create-progress";
import { ProductOptionGroupsSection } from "@/features/products/components/product-option-groups-section";
import { ProductOptionModeSection } from "@/features/products/components/product-option-mode-section";
import { ProductSubmitBar } from "@/features/products/components/product-submit-bar";
import { ProductVariantStockSection } from "@/features/products/components/product-variant-stock-section";
import { useProductCreateDraft } from "@/features/products/hooks/use-product-create-draft";

type ProductCreateFormProps = {
  usageSummary: UsageSummary;
};

export function ProductCreateForm({ usageSummary }: ProductCreateFormProps) {
  const draft = useProductCreateDraft(usageSummary);
  const nameError = draft.state.fieldErrors?.name?.[0];
  const basePriceError = draft.state.fieldErrors?.basePrice?.[0];
  const optionGroupsError = draft.state.fieldErrors?.optionGroups?.[0];
  const variantsError = draft.state.fieldErrors?.variants?.[0];

  return (
    <form className="grid gap-6 xl:grid-cols-[260px_1fr]" onSubmit={draft.handleSubmit} noValidate>
      <ProductCreateProgress usageSummary={usageSummary} />

      <div className="grid gap-5">
        {draft.state.status === "error" && draft.state.message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {draft.state.message}
          </div>
        ) : null}

        <ProductBasicSection
          basic={draft.basic}
          basePriceError={basePriceError}
          nameError={nameError}
          updateBasic={draft.updateBasic}
        />
        <ProductOptionModeSection optionMode={draft.optionMode} setOptionMode={draft.setOptionMode} />
        {draft.optionMode === "options" ? (
          <ProductOptionGroupsSection
            addOptionGroup={draft.addOptionGroup}
            addOptionValue={draft.addOptionValue}
            optionGroups={draft.optionGroups}
            optionGroupsError={optionGroupsError}
            removeOptionGroup={draft.removeOptionGroup}
            removeOptionValue={draft.removeOptionValue}
            updateOptionGroup={draft.updateOptionGroup}
            updateOptionValue={draft.updateOptionValue}
          />
        ) : null}
        <ProductVariantStockSection
          activeVariantCount={draft.activeVariantCount}
          optionCombinationLimit={draft.optionCombinationLimit}
          optionCombinationLimitExceeded={draft.optionCombinationLimitExceeded}
          updateVariant={draft.updateVariant}
          variants={draft.variants}
          variantsError={variantsError}
        />
        <ProductSubmitBar
          cancelHref="/products"
          confirmOnCancel={draft.isDirty}
          optionCombinationLimitExceeded={draft.optionCombinationLimitExceeded}
          pending={draft.pending}
          productLimitReached={draft.productLimitReached}
        />
      </div>
    </form>
  );
}
