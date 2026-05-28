import { ProductMutationError, ProductNotFoundError } from "@/server/products/errors";
import type { ProductDetail, ProductListItem, ProductsSupabaseClient } from "@/server/products/types";
import { getReservedQuantitiesForStore } from "@/server/orders/service";

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

function isSchemaMissingError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "PGRST205" || error.code === "42P01" || message.includes("could not find the table");
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

export function isProductSchemaMissingError(error: unknown) {
  return error instanceof ProductMutationError && isSchemaMissingError(error);
}
