import { ProductMutationError, ProductNotFoundError, ProductValidationError } from "@/server/products/errors";
import type { ProductEditValues } from "@/features/products/schemas/product-edit-schema";
import type { ProductDetail, ProductListItem, ProductsSupabaseClient } from "@/server/products/types";
import { getReservedQuantitiesForStore } from "@/server/orders/service";
import { getPaginationRange, getTotalPages } from "@/server/shared/pagination";
import type { PaginatedResult, PaginationParams } from "@/shared/types/pagination";

export { createProductForStore } from "@/server/products/create-product";
export {
  ProductMutationError,
  ProductNotFoundError,
  ProductUsageLimitError,
  ProductValidationError,
  isProductMutationError,
  isProductNotFoundError,
  isProductUsageLimitError,
  isProductValidationError
} from "@/server/products/errors";
export type { CreateProductResult, ProductDetail, ProductListItem } from "@/server/products/types";

export type ProductListFilters = {
  keyword?: string;
  status?: ProductListItem["status"];
};

function isSchemaMissingError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "PGRST205" || error.code === "42P01" || message.includes("could not find the table");
}

export async function listProductsForStore(
  supabase: ProductsSupabaseClient,
  storeId: string,
  pagination: PaginationParams,
  filters: ProductListFilters = {}
): Promise<PaginatedResult<ProductListItem>> {
  const { from, to } = getPaginationRange(pagination);
  let query = supabase
    .from("products")
    .select("id, name, base_price, status, has_options, created_at", { count: "exact" })
    .eq("store_id", storeId);

  if (filters.keyword) {
    query = query.ilike("name", `%${filters.keyword}%`);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { count, data: products, error: productError } = await query.order("created_at", { ascending: false }).range(from, to);

  if (productError) {
    throw new ProductMutationError(productError);
  }

  const totalCount = count ?? 0;

  if (!products?.length) {
    return {
      ...pagination,
      items: [],
      totalCount,
      totalPages: getTotalPages(totalCount, pagination.pageSize)
    };
  }

  const productIds = products.map((product) => product.id);
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("product_id, current_stock, is_active")
    .in("product_id", productIds);

  if (variantError) {
    throw new ProductMutationError(variantError);
  }

  return {
    ...pagination,
    items: products.map((product) => {
      const productVariants = variants?.filter((variant) => variant.product_id === product.id && variant.is_active) ?? [];

      return {
        ...product,
        variantCount: productVariants.length,
        totalCurrentStock: productVariants.reduce((total, variant) => total + variant.current_stock, 0)
      };
    }),
    totalCount,
    totalPages: getTotalPages(totalCount, pagination.pageSize)
  };
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

  const reservedByVariantId = await getReservedQuantitiesForStore(supabase, storeId);

  return {
    ...product,
    variants: (variants ?? []).map((variant) => {
      const reservedQuantity = reservedByVariantId.get(variant.id) ?? 0;

      return {
        ...variant,
        availableStock: Math.max(variant.current_stock - reservedQuantity, 0),
        reservedQuantity
      };
    })
  };
}

export async function updateProductBasicForStore(
  supabase: ProductsSupabaseClient,
  storeId: string,
  productId: string,
  values: ProductEditValues
) {
  const { data: existingProduct, error: existingProductError } = await supabase
    .from("products")
    .select("id, has_options")
    .eq("store_id", storeId)
    .eq("id", productId)
    .maybeSingle();

  if (existingProductError) {
    throw new ProductMutationError(existingProductError);
  }

  if (!existingProduct) {
    throw new ProductNotFoundError();
  }

  if (values.variants?.length) {
    const { data: currentVariants, error: currentVariantError } = await supabase
      .from("product_variants")
      .select("id, is_active")
      .eq("product_id", existingProduct.id);

    if (currentVariantError) {
      throw new ProductMutationError(currentVariantError);
    }

    const currentVariantById = new Map((currentVariants ?? []).map((variant) => [variant.id, variant]));
    const requestedVariantIds = new Set(values.variants.map((variant) => variant.id));

    if (requestedVariantIds.size !== values.variants.length) {
      throw new ProductValidationError("옵션 조합 정보가 중복되었습니다.");
    }

    if (values.variants.some((variant) => !currentVariantById.has(variant.id))) {
      throw new ProductValidationError("수정할 수 없는 옵션 조합이 포함되어 있습니다.");
    }

    if (values.status !== "hidden" && values.variants.every((variant) => !variant.isActive)) {
      throw new ProductValidationError("판매중 또는 품절 상품은 사용할 옵션 조합이 1개 이상 필요합니다.");
    }
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .update({
      base_price: values.basePrice,
      memo: values.memo?.trim() || null,
      name: values.name.trim(),
      status: values.status
    })
    .eq("store_id", storeId)
    .eq("id", productId)
    .select("id, has_options")
    .maybeSingle();

  if (productError) {
    throw new ProductMutationError(productError);
  }

  if (!product) {
    throw new ProductNotFoundError();
  }

  if (values.variants?.length) {
    const variantUpdates = values.variants.map((variant) =>
      supabase
        .from("product_variants")
        .update({
          is_active: variant.isActive
        })
        .eq("product_id", product.id)
        .eq("id", variant.id)
    );
    const updateResults = await Promise.all(variantUpdates);
    const variantError = updateResults.find((result) => result.error)?.error;

    if (variantError) {
      throw new ProductMutationError(variantError);
    }
  }

  if (!product.has_options) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .update({
        price: values.basePrice
      })
      .eq("product_id", product.id);

    if (variantError) {
      throw new ProductMutationError(variantError);
    }
  }

  return {
    productId: product.id
  };
}

export function isProductSchemaMissingError(error: unknown) {
  return error instanceof ProductMutationError && isSchemaMissingError(error);
}
