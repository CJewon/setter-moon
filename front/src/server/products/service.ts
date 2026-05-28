import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductCreateValues, ProductVariantValues } from "@/features/products/schemas/product-form-schema";
import { getActiveVariantOptionMismatch } from "@/features/products/utils/product-option-validation";
import type { Store } from "@/server/stores/service";
import { getStoreUsageCounts } from "@/server/usage/service";
import { PLAN_IDS, type PlanId } from "@/server/usage/usage-policy";
import type { Database } from "@/shared/types/database";

type ProductsSupabaseClient = SupabaseClient<Database>;
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];

export type ProductListItem = Pick<ProductRow, "id" | "name" | "base_price" | "status" | "has_options" | "created_at"> & {
  variantCount: number;
  totalCurrentStock: number;
};

export type ProductDetail = ProductRow & {
  variants: ProductVariantRow[];
};

export type CreateProductResult = {
  productId: string;
};

export class ProductUsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductUsageLimitError";
  }
}

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}

export class ProductMutationError extends Error {
  code?: string;
  details?: string;
  hint?: string;

  constructor(error: { code?: string; message?: string; details?: string; hint?: string }) {
    super(error.message ?? "Product mutation failed.");
    this.name = "ProductMutationError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

export class ProductNotFoundError extends Error {
  constructor(message = "Product not found.") {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

export function isProductUsageLimitError(error: unknown) {
  return error instanceof ProductUsageLimitError;
}

export function isProductValidationError(error: unknown) {
  return error instanceof ProductValidationError;
}

export function isProductMutationError(error: unknown) {
  return error instanceof ProductMutationError;
}

export function isProductNotFoundError(error: unknown) {
  return error instanceof ProductNotFoundError;
}

function isFreePlan(planId: PlanId) {
  return planId === PLAN_IDS.FREE;
}

function getVariantName(variant: ProductVariantValues) {
  return variant.options.length > 0 ? variant.options.map((option) => option.value).join(" / ") : "기본";
}

function createOptionValueKey(groupName: string, value: string) {
  return `${groupName}\u001f${value}`;
}

function isSchemaMissingError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "PGRST205" || error.code === "42P01" || message.includes("could not find the table");
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

export async function listProductsForStore(supabase: ProductsSupabaseClient, storeId: string): Promise<ProductListItem[]> {
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, base_price, status, has_options, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (productError) {
    throw new ProductMutationError(productError);
  }

  if (!products?.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("product_id, current_stock, is_active")
    .in("product_id", productIds);

  if (variantError) {
    throw new ProductMutationError(variantError);
  }

  return products.map((product) => {
    const productVariants = variants?.filter((variant) => variant.product_id === product.id && variant.is_active) ?? [];

    return {
      ...product,
      variantCount: productVariants.length,
      totalCurrentStock: productVariants.reduce((total, variant) => total + variant.current_stock, 0)
    };
  });
}

export async function getProductDetailForStore(
  supabase: ProductsSupabaseClient,
  storeId: string,
  productId: string
): Promise<ProductDetail> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, store_id, category_id, name, description, image_url, base_price, base_cost, status, memo, has_options, created_at, updated_at")
    .eq("store_id", storeId)
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new ProductMutationError(productError);
  }

  if (!product) {
    throw new ProductNotFoundError();
  }

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, product_id, sku_name, sku_code, price, cost, current_stock, safety_stock, is_active, memo, created_at, updated_at")
    .eq("product_id", product.id)
    .order("created_at", { ascending: true });

  if (variantError) {
    throw new ProductMutationError(variantError);
  }

  return {
    ...product,
    variants: variants ?? []
  };
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
    const { data: product, error: productError } = await supabase
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

    if (productError) {
      throw new ProductMutationError(productError);
    }

    const createdProductId = product.id;
    productId = createdProductId;

    const optionValueIds = new Map<string, string>();

    if (values.optionMode === "options" && values.optionGroups.length > 0) {
      const { data: groups, error: groupError } = await supabase
        .from("product_option_groups")
        .insert(
          values.optionGroups.map((group, index) => ({
            product_id: createdProductId,
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

      if (optionValueInserts.length > 0) {
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
      }
    }

    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .insert(
        activeVariants.map((variant) => ({
          product_id: createdProductId,
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

    if (variantError) {
      throw new ProductMutationError(variantError);
    }

    const variantRows = variants ?? [];

    if (variantRows.length !== activeVariants.length) {
      throw new Error("Created variant count does not match request.");
    }

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

    if (variantOptionInserts.length > 0) {
      const { error: variantOptionError } = await supabase.from("product_variant_options").insert(variantOptionInserts);

      if (variantOptionError) {
        throw new ProductMutationError(variantOptionError);
      }
    }

    const stockMovementInserts = activeVariants.flatMap((variant, variantIndex) => {
      const variantId = variantRows[variantIndex]?.id;

      if (!variantId || variant.currentStock <= 0) {
        return [];
      }

      return {
        store_id: store.id,
        product_id: createdProductId,
        variant_id: variantId,
        type: "inbound" as const,
        quantity: variant.currentStock,
        before_stock: 0,
        after_stock: variant.currentStock,
        memo: "상품 등록 초기 재고"
      };
    });

    if (stockMovementInserts.length > 0) {
      const { error: stockMovementError } = await supabase.from("stock_movements").insert(stockMovementInserts);

      if (stockMovementError) {
        throw new ProductMutationError(stockMovementError);
      }
    }

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

export function isProductSchemaMissingError(error: unknown) {
  return error instanceof ProductMutationError && isSchemaMissingError(error);
}
