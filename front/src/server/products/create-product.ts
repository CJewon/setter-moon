import type { ProductCreateValues, ProductVariantValues } from "@/features/products/schemas/product-form-schema";
import { getActiveVariantOptionMismatch } from "@/features/products/utils/product-option-validation";
import type { Store } from "@/server/stores/service";
import { getStoreUsageCounts } from "@/server/usage/service";
import { PLAN_IDS, type PlanId } from "@/server/usage/usage-policy";
import { ProductMutationError, ProductUsageLimitError, ProductValidationError } from "@/server/products/errors";
import type { CreateProductResult, ProductsSupabaseClient } from "@/server/products/types";

function isFreePlan(planId: PlanId) {
  return planId === PLAN_IDS.FREE;
}

function getVariantName(variant: ProductVariantValues) {
  return variant.options.length > 0 ? variant.options.map((option) => option.value).join(" / ") : "기본";
}

function createOptionValueKey(groupName: string, value: string) {
  return `${groupName}\u001f${value}`;
}

function isDbLimitError(error: ProductMutationError) {
  return error.code === "P0001" && error.message.toLowerCase().includes("free plan");
}

async function assertFreePlanCapacity(
  supabase: ProductsSupabaseClient,
  store: Store,
  planId: PlanId,
  variantCountToAdd: number
) {
  if (!isFreePlan(planId)) {
    return;
  }

  const usage = await getStoreUsageCounts(supabase, store.id);

  if (usage.productCount >= 10) {
    throw new ProductUsageLimitError("무료 플랜 상품 한도 10개를 모두 사용했어요.");
  }

  if (usage.skuCount + variantCountToAdd > 100) {
    throw new ProductUsageLimitError("무료 플랜 옵션 조합 한도 100개를 초과합니다. 사용하지 않을 조합을 제외해 주세요.");
  }
}

async function insertProduct(supabase: ProductsSupabaseClient, store: Store, values: ProductCreateValues) {
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      store_id: store.id,
      name: values.name.trim(),
      base_price: values.basePrice,
      base_cost: values.baseCost,
      status: values.status,
      memo: values.memo?.trim() || null,
      has_options: values.optionMode === "options"
    })
    .select("id")
    .single();

  if (error) {
    throw new ProductMutationError(error);
  }

  return product.id;
}

async function insertOptionValues(supabase: ProductsSupabaseClient, productId: string, values: ProductCreateValues) {
  const optionValueIds = new Map<string, string>();

  if (values.optionMode !== "options" || values.optionGroups.length === 0) {
    return optionValueIds;
  }

  const { data: groups, error: groupError } = await supabase
    .from("product_option_groups")
    .insert(
      values.optionGroups.map((group, index) => ({
        product_id: productId,
        name: group.name,
        sort_order: index
      }))
    )
    .select("id, name, sort_order");

  if (groupError) {
    throw new ProductMutationError(groupError);
  }

  const groupIdByName = new Map((groups ?? []).map((group) => [group.name, group.id]));
  const optionValueInserts = values.optionGroups.flatMap((group) => {
    const optionGroupId = groupIdByName.get(group.name);

    if (!optionGroupId) {
      return [];
    }

    return group.values.map((value, index) => ({
      option_group_id: optionGroupId,
      value,
      sort_order: index
    }));
  });

  if (optionValueInserts.length === 0) {
    return optionValueIds;
  }

  const { data: optionValues, error: valueError } = await supabase
    .from("product_option_values")
    .insert(optionValueInserts)
    .select("id, option_group_id, value");

  if (valueError) {
    throw new ProductMutationError(valueError);
  }

  (optionValues ?? []).forEach((optionValue) => {
    const group = groups?.find((item) => item.id === optionValue.option_group_id);

    if (group) {
      optionValueIds.set(createOptionValueKey(group.name, optionValue.value), optionValue.id);
    }
  });

  return optionValueIds;
}

async function insertVariants(supabase: ProductsSupabaseClient, productId: string, activeVariants: ProductVariantValues[]) {
  const { data: variants, error } = await supabase
    .from("product_variants")
    .insert(
      activeVariants.map((variant) => ({
        product_id: productId,
        sku_name: getVariantName(variant),
        price: variant.price,
        cost: variant.cost,
        current_stock: variant.currentStock,
        safety_stock: variant.safetyStock,
        is_active: true,
        memo: variant.memo?.trim() || null
      }))
    )
    .select("id, sku_name, current_stock");

  if (error) {
    throw new ProductMutationError(error);
  }

  if ((variants ?? []).length !== activeVariants.length) {
    throw new Error("Created variant count does not match request.");
  }

  return variants ?? [];
}

async function insertVariantOptionLinks(
  supabase: ProductsSupabaseClient,
  values: ProductCreateValues,
  activeVariants: ProductVariantValues[],
  variantRows: { id: string }[],
  optionValueIds: Map<string, string>
) {
  const variantOptionInserts = activeVariants.flatMap((variant, variantIndex) => {
    const variantId = variantRows[variantIndex]?.id;

    return variant.options.flatMap((option) => {
      const optionValueId = optionValueIds.get(createOptionValueKey(option.groupName, option.value));

      if (!variantId || !optionValueId) {
        return [];
      }

      return {
        variant_id: variantId,
        option_value_id: optionValueId
      };
    });
  });

  if (values.optionMode === "options" && variantOptionInserts.length !== activeVariants.length * values.optionGroups.length) {
    throw new ProductValidationError("활성 옵션 조합이 옵션 그룹과 맞지 않습니다.");
  }

  if (variantOptionInserts.length === 0) {
    return;
  }

  const { error } = await supabase.from("product_variant_options").insert(variantOptionInserts);

  if (error) {
    throw new ProductMutationError(error);
  }
}

async function insertInitialStockMovements(
  supabase: ProductsSupabaseClient,
  store: Store,
  productId: string,
  activeVariants: ProductVariantValues[],
  variantRows: { id: string }[]
) {
  const stockMovementInserts = activeVariants.flatMap((variant, variantIndex) => {
    const variantId = variantRows[variantIndex]?.id;

    if (!variantId || variant.currentStock <= 0) {
      return [];
    }

    return {
      store_id: store.id,
      product_id: productId,
      variant_id: variantId,
      type: "inbound" as const,
      quantity: variant.currentStock,
      before_stock: 0,
      after_stock: variant.currentStock,
      memo: "상품 등록 초기 재고"
    };
  });

  if (stockMovementInserts.length === 0) {
    return;
  }

  const { error } = await supabase.from("stock_movements").insert(stockMovementInserts);

  if (error) {
    throw new ProductMutationError(error);
  }
}

export async function createProductForStore(
  supabase: ProductsSupabaseClient,
  store: Store,
  planId: PlanId,
  values: ProductCreateValues
): Promise<CreateProductResult> {
  const activeVariants = values.variants.filter((variant) => variant.isActive);
  let productId: string | undefined;
  const mismatchMessage = getActiveVariantOptionMismatch(values);

  if (mismatchMessage) {
    throw new ProductValidationError(mismatchMessage);
  }

  await assertFreePlanCapacity(supabase, store, planId, activeVariants.length);

  try {
    productId = await insertProduct(supabase, store, values);

    const optionValueIds = await insertOptionValues(supabase, productId, values);
    const variantRows = await insertVariants(supabase, productId, activeVariants);

    await insertVariantOptionLinks(supabase, values, activeVariants, variantRows, optionValueIds);
    await insertInitialStockMovements(supabase, store, productId, activeVariants, variantRows);

    return { productId };
  } catch (error) {
    if (productId) {
      await supabase.from("products").delete().eq("id", productId).eq("store_id", store.id);
    }

    if (error instanceof ProductMutationError && isDbLimitError(error)) {
      throw new ProductUsageLimitError(
        error.message.includes("SKU") ? "무료 플랜 옵션 조합 한도 100개를 초과합니다." : "무료 플랜 상품 한도 10개를 모두 사용했어요."
      );
    }

    throw error;
  }
}
