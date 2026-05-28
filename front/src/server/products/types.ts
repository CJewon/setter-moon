import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";

export type ProductsSupabaseClient = SupabaseClient<Database>;
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];

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
