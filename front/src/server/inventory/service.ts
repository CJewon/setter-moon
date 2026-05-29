import type { SupabaseClient } from "@supabase/supabase-js";
import { getReservedQuantitiesForStore } from "@/server/orders/service";
import { getPaginationRange, getTotalPages } from "@/server/shared/pagination";
import type { Database } from "@/shared/types/database";
import type { PaginatedResult, PaginationParams } from "@/shared/types/pagination";
import type { InventoryAdjustmentValues } from "@/features/inventory/schemas/inventory-adjustment-schema";

type InventorySupabaseClient = SupabaseClient<Database>;
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
type StockMovementRow = Database["public"]["Tables"]["stock_movements"]["Row"];

export type InventoryStatus = "low" | "normal" | "out";

export class InventoryMutationError extends Error {
  code?: string;

  constructor(error: { code?: string; message?: string }) {
    super(error.message ?? "Inventory mutation failed");
    this.name = "InventoryMutationError";
    this.code = error.code;
  }
}

export class InventoryNotFoundError extends Error {
  constructor() {
    super("재고를 조정할 상품 옵션을 찾을 수 없습니다.");
    this.name = "InventoryNotFoundError";
  }
}

export class InventoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryValidationError";
  }
}

export class InventoryConflictError extends Error {
  constructor() {
    super("다른 작업으로 재고가 변경되었습니다. 새로고침 후 다시 시도해 주세요.");
    this.name = "InventoryConflictError";
  }
}

export type InventoryListFilters = {
  keyword?: string;
  status?: InventoryStatus;
};

export type InventoryListItem = {
  availableStock: number;
  currentStock: number;
  productId: string;
  productName: string;
  reservedQuantity: number;
  safetyStock: number;
  skuCode: string | null;
  status: InventoryStatus;
  updatedAt: string;
  variantId: string;
  variantName: string;
};

export type InventorySummary = {
  lowStockVariantCount: number;
  outOfStockVariantCount: number;
  totalCurrentStock: number;
  totalReservedQuantity: number;
  totalVariantCount: number;
};

export type StockMovementListItem = {
  afterStock: number;
  beforeStock: number;
  createdAt: string;
  id: string;
  memo: string | null;
  orderId: string | null;
  productId: string;
  productName: string;
  quantity: number;
  type: StockMovementRow["type"];
  variantName: string;
};

export function isInventoryConflictError(error: unknown) {
  return error instanceof InventoryConflictError;
}

export function isInventoryMutationError(error: unknown) {
  return error instanceof InventoryMutationError;
}

export function isInventoryNotFoundError(error: unknown) {
  return error instanceof InventoryNotFoundError;
}

export function isInventoryValidationError(error: unknown) {
  return error instanceof InventoryValidationError;
}

function getInventoryStatus(availableStock: number, safetyStock: number): InventoryStatus {
  if (availableStock <= 0) {
    return "out";
  }

  if (safetyStock > 0 && availableStock <= safetyStock) {
    return "low";
  }

  return "normal";
}

function createInventoryItem(
  product: Pick<ProductRow, "id" | "name">,
  variant: Pick<ProductVariantRow, "current_stock" | "id" | "is_active" | "safety_stock" | "sku_code" | "sku_name" | "updated_at">,
  reservedQuantity: number
): InventoryListItem {
  const availableStock = Math.max(variant.current_stock - reservedQuantity, 0);

  return {
    availableStock,
    currentStock: variant.current_stock,
    productId: product.id,
    productName: product.name,
    reservedQuantity,
    safetyStock: variant.safety_stock,
    skuCode: variant.sku_code,
    status: getInventoryStatus(availableStock, variant.safety_stock),
    updatedAt: variant.updated_at,
    variantId: variant.id,
    variantName: variant.sku_name
  };
}

function getPageItems<T>(items: T[], pagination: PaginationParams) {
  const { from, to } = getPaginationRange(pagination);

  return items.slice(from, to + 1);
}

async function getInventorySnapshotForStore(supabase: InventorySupabaseClient, storeId: string) {
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("store_id", storeId)
    .order("name", { ascending: true });

  if (productError) {
    throw new Error(productError.message);
  }

  if (!products?.length) {
    return [];
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, product_id, sku_name, sku_code, current_stock, safety_stock, is_active, updated_at")
    .in(
      "product_id",
      products.map((product) => product.id)
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (variantError) {
    throw new Error(variantError.message);
  }

  const reservedByVariantId = await getReservedQuantitiesForStore(supabase, storeId);

  return (variants ?? [])
    .map((variant) => {
      const product = productById.get(variant.product_id);

      return product ? createInventoryItem(product, variant, reservedByVariantId.get(variant.id) ?? 0) : null;
    })
    .filter((item): item is InventoryListItem => Boolean(item));
}

function applyInventoryFilters(items: InventoryListItem[], filters: InventoryListFilters) {
  const keyword = filters.keyword?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword = keyword
      ? item.productName.toLowerCase().includes(keyword) ||
        item.variantName.toLowerCase().includes(keyword) ||
        item.skuCode?.toLowerCase().includes(keyword)
      : true;
    const matchesStatus = filters.status ? item.status === filters.status : true;

    return matchesKeyword && matchesStatus;
  });
}

export async function listInventoryItemsForStore(
  supabase: InventorySupabaseClient,
  storeId: string,
  pagination: PaginationParams,
  filters: InventoryListFilters = {}
): Promise<PaginatedResult<InventoryListItem>> {
  const items = applyInventoryFilters(await getInventorySnapshotForStore(supabase, storeId), filters);

  return {
    ...pagination,
    items: getPageItems(items, pagination),
    totalCount: items.length,
    totalPages: getTotalPages(items.length, pagination.pageSize)
  };
}

export async function listLowStockItemsForStore(
  supabase: InventorySupabaseClient,
  storeId: string,
  pagination: PaginationParams
): Promise<PaginatedResult<InventoryListItem>> {
  const items = (await getInventorySnapshotForStore(supabase, storeId)).filter((item) => item.status !== "normal");

  return {
    ...pagination,
    items: getPageItems(items, pagination),
    totalCount: items.length,
    totalPages: getTotalPages(items.length, pagination.pageSize)
  };
}

export async function getInventorySummaryForStore(
  supabase: InventorySupabaseClient,
  storeId: string
): Promise<InventorySummary> {
  const items = await getInventorySnapshotForStore(supabase, storeId);

  return {
    lowStockVariantCount: items.filter((item) => item.status === "low").length,
    outOfStockVariantCount: items.filter((item) => item.status === "out").length,
    totalCurrentStock: items.reduce((total, item) => total + item.currentStock, 0),
    totalReservedQuantity: items.reduce((total, item) => total + item.reservedQuantity, 0),
    totalVariantCount: items.length
  };
}

export async function listStockMovementsForStore(
  supabase: InventorySupabaseClient,
  storeId: string,
  pagination: PaginationParams
): Promise<PaginatedResult<StockMovementListItem>> {
  const { from, to } = getPaginationRange(pagination);
  const { count, data: movements, error: movementError } = await supabase
    .from("stock_movements")
    .select("id, product_id, variant_id, type, quantity, before_stock, after_stock, order_id, memo, created_at", { count: "exact" })
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (movementError) {
    throw new Error(movementError.message);
  }

  if (!movements?.length) {
    const totalCount = count ?? 0;

    return {
      ...pagination,
      items: [],
      totalCount,
      totalPages: getTotalPages(totalCount, pagination.pageSize)
    };
  }

  const productIds = [...new Set(movements.map((movement) => movement.product_id))];
  const variantIds = [...new Set(movements.map((movement) => movement.variant_id))];
  const [{ data: products, error: productError }, { data: variants, error: variantError }] = await Promise.all([
    supabase.from("products").select("id, name").in("id", productIds),
    supabase.from("product_variants").select("id, sku_name").in("id", variantIds)
  ]);

  if (productError) {
    throw new Error(productError.message);
  }

  if (variantError) {
    throw new Error(variantError.message);
  }

  const productById = new Map((products ?? []).map((product) => [product.id, product.name]));
  const variantById = new Map((variants ?? []).map((variant) => [variant.id, variant.sku_name]));
  const totalCount = count ?? 0;

  return {
    ...pagination,
    items: movements.map((movement) => ({
      afterStock: movement.after_stock,
      beforeStock: movement.before_stock,
      createdAt: movement.created_at,
      id: movement.id,
      memo: movement.memo,
      orderId: movement.order_id,
      productId: movement.product_id,
      productName: productById.get(movement.product_id) ?? "삭제된 상품",
      quantity: movement.quantity,
      type: movement.type,
      variantName: variantById.get(movement.variant_id) ?? "삭제된 옵션"
    })),
    totalCount,
    totalPages: getTotalPages(totalCount, pagination.pageSize)
  };
}

export async function adjustInventoryForStore(
  supabase: InventorySupabaseClient,
  storeId: string,
  values: InventoryAdjustmentValues
) {
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, product_id, current_stock")
    .eq("id", values.variantId)
    .maybeSingle();

  if (variantError) {
    throw new InventoryMutationError(variantError);
  }

  if (!variant) {
    throw new InventoryNotFoundError();
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, store_id")
    .eq("id", variant.product_id)
    .eq("store_id", storeId)
    .maybeSingle();

  if (productError) {
    throw new InventoryMutationError(productError);
  }

  if (!product) {
    throw new InventoryNotFoundError();
  }

  const beforeStock = variant.current_stock;
  const afterStock = values.targetStock;

  if (beforeStock === afterStock) {
    throw new InventoryValidationError("현재 재고와 같은 수량입니다.");
  }

  const { data: updatedVariant, error: updateError } = await supabase
    .from("product_variants")
    .update({
      current_stock: afterStock
    })
    .eq("id", variant.id)
    .eq("current_stock", beforeStock)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new InventoryMutationError(updateError);
  }

  if (!updatedVariant) {
    throw new InventoryConflictError();
  }

  const { error: movementError } = await supabase.from("stock_movements").insert({
    after_stock: afterStock,
    before_stock: beforeStock,
    memo: values.memo.trim(),
    order_id: null,
    product_id: product.id,
    quantity: afterStock - beforeStock,
    store_id: storeId,
    type: "manual_adjust",
    variant_id: variant.id
  });

  if (movementError) {
    throw new InventoryMutationError(movementError);
  }

  return {
    afterStock,
    beforeStock,
    productId: product.id,
    variantId: variant.id
  };
}
