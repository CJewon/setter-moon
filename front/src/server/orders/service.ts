import type {
  OrderBulkStatusUpdateValues,
  OrderEditValues,
  OrderFormValues,
  OrderStatusUpdateValues
} from "@/features/orders/schemas/order-form-schema";
import {
  InsufficientStockError,
  InvalidOrderStatusTransitionError,
  OrderMutationError,
  OrderNotFoundError,
  OrderUsageLimitError,
  OrderValidationError
} from "@/server/orders/errors";
import { getAvailableStock, getStockDeductionPlan, getStockRestorePlan } from "@/server/orders/stock";
import { getPaginationRange, getTotalPages } from "@/server/shared/pagination";
import type {
  HoldReservationPolicy,
  OrderDetail,
  OrderListItem,
  OrderProductChoice,
  OrdersSupabaseClient,
  OrderStatus,
  ProductRow,
  ProductVariantRow
} from "@/server/orders/types";
import type { Store } from "@/server/stores/service";
import { getStoreUsageCounts } from "@/server/usage/service";
import { PLAN_IDS, type PlanId } from "@/server/usage/usage-policy";
import type { PaginatedResult, PaginationParams } from "@/shared/types/pagination";

export {
  InsufficientStockError,
  InvalidOrderStatusTransitionError,
  OrderMutationError,
  OrderNotFoundError,
  OrderUsageLimitError,
  OrderValidationError,
  isInsufficientStockError,
  isInvalidOrderStatusTransitionError,
  isOrderMutationError,
  isOrderNotFoundError,
  isOrderUsageLimitError,
  isOrderValidationError
} from "@/server/orders/errors";
export type { OrderDetail, OrderListItem, OrderProductChoice } from "@/server/orders/types";

const FREE_MONTHLY_ORDER_LIMIT = 300;
export type OrderSort = "latest" | "oldest";

export type OrderListFilters = {
  customerKeyword?: string;
  fromDate?: string;
  keyword?: string;
  productKeyword?: string;
  sort?: OrderSort;
  status?: OrderStatus;
  toDate?: string;
};

export type BulkOrderStatusUpdateResult = {
  failedCount: number;
  results: Array<{
    message?: string;
    orderId: string;
    status: "failed" | "updated";
  }>;
  updatedCount: number;
};

function isSchemaMissingError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "PGRST205" || error.code === "42P01" || message.includes("could not find the table");
}

function getOrderNumber() {
  const datePart = new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric"
  })
    .format(new Date())
    .replace(/\D/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `SR-${datePart}-${randomPart}`;
}

function getOrderedAt(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function getDateBoundary(value: string | undefined, edge: "end" | "start") {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const time = edge === "start" ? "00:00:00.000" : "23:59:59.999";
  const date = new Date(`${value}T${time}+09:00`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isDbLimitError(error: OrderMutationError) {
  return error.code === "P0001" && error.message.toLowerCase().includes("monthly order limit");
}

async function assertMonthlyOrderCapacity(supabase: OrdersSupabaseClient, store: Store, planId: PlanId) {
  if (planId !== PLAN_IDS.FREE) {
    return;
  }

  const usage = await getStoreUsageCounts(supabase, store.id);

  if (usage.monthlyOrderCount >= FREE_MONTHLY_ORDER_LIMIT) {
    throw new OrderUsageLimitError("무료 플랜 월 신규 주문 등록 한도 300건을 모두 사용했습니다.");
  }
}

async function getReservationOrderIds(supabase: OrdersSupabaseClient, storeId: string) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, hold_reservation_policy")
    .eq("store_id", storeId)
    .in("status", ["received", "hold"]);

  if (error) {
    throw new OrderMutationError(error);
  }

  return (orders ?? [])
    .filter((order) => order.status === "received" || order.hold_reservation_policy === "keep")
    .map((order) => order.id);
}

export async function getReservedQuantitiesForStore(supabase: OrdersSupabaseClient, storeId: string) {
  const orderIds = await getReservationOrderIds(supabase, storeId);
  const reservedByVariantId = new Map<string, number>();

  if (orderIds.length === 0) {
    return reservedByVariantId;
  }

  const { data: items, error } = await supabase.from("order_items").select("variant_id, quantity").in("order_id", orderIds);

  if (error) {
    throw new OrderMutationError(error);
  }

  (items ?? []).forEach((item) => {
    reservedByVariantId.set(item.variant_id, (reservedByVariantId.get(item.variant_id) ?? 0) + item.quantity);
  });

  return reservedByVariantId;
}

export async function getOrderProductChoicesForStore(
  supabase: OrdersSupabaseClient,
  storeId: string
): Promise<OrderProductChoice[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, status")
    .eq("store_id", storeId)
    .neq("status", "hidden")
    .order("name", { ascending: true });

  if (productsError) {
    throw new OrderMutationError(productsError);
  }

  if (!products?.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id, sku_name, price, current_stock, safety_stock, is_active")
    .in("product_id", productIds)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (variantsError) {
    throw new OrderMutationError(variantsError);
  }

  const reservedByVariantId = await getReservedQuantitiesForStore(supabase, storeId);

  return products.map((product) => {
    const productVariants = (variants ?? [])
      .filter((variant) => variant.product_id === product.id)
      .map((variant) => {
        const reservedQuantity = reservedByVariantId.get(variant.id) ?? 0;

        return {
          availableStock: getAvailableStock(variant.current_stock, reservedQuantity),
          currentStock: variant.current_stock,
          price: variant.price,
          productId: product.id,
          productName: product.name,
          reservedQuantity,
          safetyStock: variant.safety_stock,
          variantId: variant.id,
          variantName: variant.sku_name
        };
      });

    return {
      id: product.id,
      name: product.name,
      variants: productVariants
    };
  });
}

async function getProductsById(supabase: OrdersSupabaseClient, storeId: string, productIds: string[]) {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, store_id, name, status")
    .eq("store_id", storeId)
    .in("id", productIds);

  if (error) {
    throw new OrderMutationError(error);
  }

  return new Map((products ?? []).map((product) => [product.id, product as Pick<ProductRow, "id" | "name" | "status" | "store_id">]));
}

async function getOrderIdsMatchingCustomerKeyword(supabase: OrdersSupabaseClient, storeId: string, keyword: string) {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return null;
  }

  const likeKeyword = `%${trimmedKeyword.replace(/[%_]/g, " ")}%`;
  const [orderNoMatches, customerMatches] = await Promise.all([
    supabase.from("orders").select("id").eq("store_id", storeId).ilike("order_no", likeKeyword),
    supabase.from("orders").select("id").eq("store_id", storeId).ilike("customer_name", likeKeyword)
  ]);

  for (const result of [orderNoMatches, customerMatches]) {
    if (result.error) {
      throw new OrderMutationError(result.error);
    }
  }

  const ids = new Set<string>();

  (orderNoMatches.data ?? []).forEach((order) => ids.add(order.id));
  (customerMatches.data ?? []).forEach((order) => ids.add(order.id));

  return [...ids];
}

async function getOrderIdsMatchingProductKeyword(supabase: OrdersSupabaseClient, keyword: string) {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return null;
  }

  const likeKeyword = `%${trimmedKeyword.replace(/[%_]/g, " ")}%`;
  const [productMatches, variantMatches] = await Promise.all([
    supabase.from("order_items").select("order_id").ilike("product_name_snapshot", likeKeyword),
    supabase.from("order_items").select("order_id").ilike("variant_name_snapshot", likeKeyword)
  ]);

  for (const result of [productMatches, variantMatches]) {
    if (result.error) {
      throw new OrderMutationError(result.error);
    }
  }

  const ids = new Set<string>();

  (productMatches.data ?? []).forEach((item) => ids.add(item.order_id));
  (variantMatches.data ?? []).forEach((item) => ids.add(item.order_id));

  return [...ids];
}

async function getOrderIdsMatchingAnyKeyword(supabase: OrdersSupabaseClient, storeId: string, keyword: string) {
  const [customerIds, productIds] = await Promise.all([
    getOrderIdsMatchingCustomerKeyword(supabase, storeId, keyword),
    getOrderIdsMatchingProductKeyword(supabase, keyword)
  ]);

  return [...new Set([...(customerIds ?? []), ...(productIds ?? [])])];
}

function intersectOrderIds(orderIdGroups: string[][]) {
  if (orderIdGroups.length === 0) {
    return null;
  }

  return orderIdGroups.reduce((currentIds, nextIds) => {
    const nextIdSet = new Set(nextIds);

    return currentIds.filter((orderId) => nextIdSet.has(orderId));
  });
}

async function getVariantsById(supabase: OrdersSupabaseClient, variantIds: string[]) {
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id, product_id, sku_name, price, current_stock, is_active")
    .in("id", variantIds);

  if (error) {
    throw new OrderMutationError(error);
  }

  return new Map(
    (variants ?? []).map((variant) => [
      variant.id,
      variant as Pick<ProductVariantRow, "current_stock" | "id" | "is_active" | "price" | "product_id" | "sku_name">
    ])
  );
}

export async function createOrderForStore(
  supabase: OrdersSupabaseClient,
  store: Store,
  planId: PlanId,
  values: OrderFormValues
) {
  await assertMonthlyOrderCapacity(supabase, store, planId);

  const variantIds = [...new Set(values.items.map((item) => item.variantId))];
  const variantsById = await getVariantsById(supabase, variantIds);

  if (variantsById.size !== variantIds.length) {
    throw new OrderValidationError("주문할 옵션 조합을 다시 선택해 주세요.");
  }

  const productIds = [...new Set([...variantsById.values()].map((variant) => variant.product_id))];
  const productsById = await getProductsById(supabase, store.id, productIds);

  const orderItems = values.items.map((item) => {
    const variant = variantsById.get(item.variantId);
    const product = variant ? productsById.get(variant.product_id) : null;

    if (!variant?.is_active || !product || product.status === "hidden") {
      throw new OrderValidationError("주문할 상품과 옵션 조합을 다시 선택해 주세요.");
    }

    return {
      product_id: product.id,
      product_name_snapshot: product.name,
      quantity: item.quantity,
      total_price: item.quantity * item.unitPrice,
      unit_price: item.unitPrice,
      variant_id: variant.id,
      variant_name_snapshot: variant.sku_name
    };
  });
  const totalAmount = orderItems.reduce((total, item) => total + item.total_price, 0);
  let orderId: string | undefined;

  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: values.customerName.trim(),
        customer_phone: values.customerPhone?.trim() || null,
        memo: values.memo?.trim() || null,
        order_no: getOrderNumber(),
        ordered_at: getOrderedAt(values.orderedAt),
        status: "received",
        store_id: store.id,
        total_amount: totalAmount
      })
      .select("id, order_no, status")
      .single();

    if (orderError) {
      throw new OrderMutationError(orderError);
    }

    orderId = order.id;

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemError) {
      throw new OrderMutationError(itemError);
    }

    const { error: logError } = await supabase.from("order_status_logs").insert({
      order_id: order.id,
      from_status: null,
      to_status: "received",
      memo: "주문접수로 등록"
    });

    if (logError) {
      throw new OrderMutationError(logError);
    }

    return {
      orderId: order.id,
      orderNo: order.order_no,
      status: order.status
    };
  } catch (error) {
    if (orderId) {
      await supabase.from("orders").delete().eq("id", orderId).eq("store_id", store.id);
    }

    if (error instanceof OrderMutationError && isDbLimitError(error)) {
      throw new OrderUsageLimitError("무료 플랜 월 신규 주문 등록 한도 300건을 모두 사용했습니다.");
    }

    throw error;
  }
}

export async function listOrdersForStore(
  supabase: OrdersSupabaseClient,
  storeId: string,
  filters: OrderListFilters,
  pagination: PaginationParams
): Promise<PaginatedResult<OrderListItem>> {
  const { from, to } = getPaginationRange(pagination);
  const keywordGroups = (
    await Promise.all([
      filters.keyword ? getOrderIdsMatchingAnyKeyword(supabase, storeId, filters.keyword) : null,
      filters.customerKeyword ? getOrderIdsMatchingCustomerKeyword(supabase, storeId, filters.customerKeyword) : null,
      filters.productKeyword ? getOrderIdsMatchingProductKeyword(supabase, filters.productKeyword) : null
    ])
  ).filter((ids): ids is string[] => Array.isArray(ids));
  const keywordOrderIds = intersectOrderIds(keywordGroups);

  if (keywordOrderIds && keywordOrderIds.length === 0) {
    return {
      ...pagination,
      items: [],
      totalCount: 0,
      totalPages: 0
    };
  }

  const fromDate = getDateBoundary(filters.fromDate, "start");
  const toDate = getDateBoundary(filters.toDate, "end");
  const sort = filters.sort === "oldest" ? "oldest" : "latest";
  let query = supabase
    .from("orders")
    .select("id, order_no, customer_name, status, total_amount, ordered_at, created_at", { count: "exact" })
    .eq("store_id", storeId)
    .order("ordered_at", { ascending: sort === "oldest" })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (keywordOrderIds) {
    query = query.in("id", keywordOrderIds);
  }

  if (fromDate) {
    query = query.gte("ordered_at", fromDate);
  }

  if (toDate) {
    query = query.lte("ordered_at", toDate);
  }

  const { count, data: orders, error } = await query;

  if (error) {
    throw new OrderMutationError(error);
  }

  if (!orders?.length) {
    const totalCount = count ?? 0;

    return {
      ...pagination,
      items: [],
      totalCount,
      totalPages: getTotalPages(totalCount, pagination.pageSize)
    };
  }

  const orderIds = orders.map((order) => order.id);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("order_id, product_name_snapshot, variant_name_snapshot, quantity")
    .in("order_id", orderIds);

  if (itemsError) {
    throw new OrderMutationError(itemsError);
  }

  const totalCount = count ?? 0;

  return {
    ...pagination,
    items: orders.map((order) => {
      const orderItems = items?.filter((item) => item.order_id === order.id) ?? [];
      const firstItem = orderItems[0];
      const extraCount = Math.max(orderItems.length - 1, 0);
      const itemSummary = firstItem
        ? `${firstItem.product_name_snapshot} · ${firstItem.variant_name_snapshot}${extraCount ? ` 외 ${extraCount}건` : ""}`
        : "주문 상품 없음";

      return {
        ...order,
        itemSummary,
        totalQuantity: orderItems.reduce((total, item) => total + item.quantity, 0)
      };
    }),
    totalCount,
    totalPages: getTotalPages(totalCount, pagination.pageSize)
  };
}

export async function getOrderDetailForStore(
  supabase: OrdersSupabaseClient,
  storeId: string,
  orderId: string
): Promise<OrderDetail> {
  const { data: order, error } = await supabase.from("orders").select("*").eq("store_id", storeId).eq("id", orderId).maybeSingle();

  if (error) {
    throw new OrderMutationError(error);
  }

  if (!order) {
    throw new OrderNotFoundError();
  }

  const [{ data: items, error: itemsError }, { data: statusLogs, error: logsError }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
    supabase.from("order_status_logs").select("*").eq("order_id", order.id).order("created_at", { ascending: true })
  ]);

  if (itemsError) {
    throw new OrderMutationError(itemsError);
  }

  if (logsError) {
    throw new OrderMutationError(logsError);
  }

  return {
    ...order,
    items: items ?? [],
    statusLogs: statusLogs ?? []
  };
}

function assertStatusTransition(currentStatus: OrderStatus, values: OrderStatusUpdateValues) {
  const nextStatus = values.toStatus;
  const allowed =
    (currentStatus === "received" && ["ready_to_ship", "cancelled", "hold"].includes(nextStatus)) ||
    (currentStatus === "hold" && ["received", "ready_to_ship", "cancelled"].includes(nextStatus)) ||
    (currentStatus === "ready_to_ship" && ["shipping", "cancelled"].includes(nextStatus)) ||
    (currentStatus === "shipping" && nextStatus === "delivered");

  if (!allowed) {
    throw new InvalidOrderStatusTransitionError();
  }

  if (nextStatus === "hold" && !values.holdReservationPolicy) {
    throw new OrderValidationError("보류 처리 시 예약 수량 유지 여부를 선택해 주세요.");
  }
}

async function fetchOrderItemsAndVariants(supabase: OrdersSupabaseClient, orderId: string) {
  const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId);

  if (itemsError) {
    throw new OrderMutationError(itemsError);
  }

  if (!items?.length) {
    throw new OrderValidationError("주문 상품이 없어 상태를 변경할 수 없습니다.");
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, current_stock")
    .in(
      "id",
      items.map((item) => item.variant_id)
    );

  if (variantsError) {
    throw new OrderMutationError(variantsError);
  }

  return {
    items,
    variants: (variants ?? []) as Pick<ProductVariantRow, "current_stock" | "id">[]
  };
}

async function applyStockPlan(
  supabase: OrdersSupabaseClient,
  store: Store,
  orderId: string,
  movementType: "sale_deduction" | "cancel_restore",
  memo: string,
  plan: ReturnType<typeof getStockDeductionPlan>
) {
  for (const planItem of plan) {
    const { data: updatedVariant, error: updateError } = await supabase
      .from("product_variants")
      .update({ current_stock: planItem.afterStock })
      .eq("id", planItem.variant.id)
      .eq("current_stock", planItem.beforeStock)
      .select("id")
      .maybeSingle();

    if (updateError) {
      throw new OrderMutationError(updateError);
    }

    if (!updatedVariant) {
      throw new InsufficientStockError();
    }

    const { error: movementError } = await supabase.from("stock_movements").insert({
      after_stock: planItem.afterStock,
      before_stock: planItem.beforeStock,
      memo,
      order_id: orderId,
      product_id: planItem.item.product_id,
      quantity: planItem.item.quantity,
      store_id: store.id,
      type: movementType,
      variant_id: planItem.item.variant_id
    });

    if (movementError) {
      throw new OrderMutationError(movementError);
    }
  }
}

export async function updateOrderStatusForStore(
  supabase: OrdersSupabaseClient,
  store: Store,
  orderId: string,
  values: OrderStatusUpdateValues
) {
  const order = await getOrderDetailForStore(supabase, store.id, orderId);

  assertStatusTransition(order.status, values);

  if (values.toStatus === "ready_to_ship") {
    const { items, variants } = await fetchOrderItemsAndVariants(supabase, order.id);
    const plan = getStockDeductionPlan(items, variants);

    await applyStockPlan(supabase, store, order.id, "sale_deduction", "배송대기 전환 재고 차감", plan);
  }

  if (order.status === "ready_to_ship" && values.toStatus === "cancelled" && values.restoreStock !== false) {
    const { items, variants } = await fetchOrderItemsAndVariants(supabase, order.id);
    const plan = getStockRestorePlan(items, variants);

    await applyStockPlan(supabase, store, order.id, "cancel_restore", "주문 취소 재고 복구", plan);
  }

  const holdReservationPolicy: HoldReservationPolicy | null =
    values.toStatus === "hold" ? values.holdReservationPolicy ?? "keep" : order.hold_reservation_policy;
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      hold_reservation_policy: holdReservationPolicy,
      status: values.toStatus
    })
    .eq("id", order.id)
    .eq("store_id", store.id);

  if (updateError) {
    throw new OrderMutationError(updateError);
  }

  const { error: logError } = await supabase.from("order_status_logs").insert({
    from_status: order.status,
    memo: values.memo?.trim() || null,
    order_id: order.id,
    to_status: values.toStatus
  });

  if (logError) {
    throw new OrderMutationError(logError);
  }

  return {
    orderId: order.id,
    status: values.toStatus
  };
}

export async function updateOrderBasicForStore(
  supabase: OrdersSupabaseClient,
  storeId: string,
  orderId: string,
  values: OrderEditValues
) {
  const order = await getOrderDetailForStore(supabase, storeId, orderId);
  const nextItem = values.items?.[0];

  if (!["received", "hold"].includes(order.status)) {
    throw new InvalidOrderStatusTransitionError("주문접수 또는 보류 상태에서만 주문 정보를 수정할 수 있습니다.");
  }

  if (nextItem && order.status !== "received") {
    throw new InvalidOrderStatusTransitionError("주문접수 상태에서만 주문 상품과 수량을 수정할 수 있습니다.");
  }

  let nextTotalAmount = order.total_amount;

  if (nextItem) {
    if (order.items.length !== 1) {
      throw new OrderValidationError("현재 화면에서는 주문 상품 1개만 수정할 수 있습니다.");
    }

    const variantsById = await getVariantsById(supabase, [nextItem.variantId]);
    const variant = variantsById.get(nextItem.variantId);

    if (!variant) {
      throw new OrderValidationError("수정할 옵션 조합을 다시 선택해 주세요.");
    }

    const productsById = await getProductsById(supabase, storeId, [variant.product_id]);
    const product = productsById.get(variant.product_id);

    if (!variant.is_active || !product || product.status === "hidden") {
      throw new OrderValidationError("수정할 상품과 옵션 조합을 다시 선택해 주세요.");
    }

    nextTotalAmount = nextItem.quantity * nextItem.unitPrice;

    const { data: updatedItem, error: itemUpdateError } = await supabase
      .from("order_items")
      .update({
        product_id: product.id,
        product_name_snapshot: product.name,
        quantity: nextItem.quantity,
        total_price: nextTotalAmount,
        unit_price: nextItem.unitPrice,
        variant_id: variant.id,
        variant_name_snapshot: variant.sku_name
      })
      .eq("id", order.items[0].id)
      .eq("order_id", order.id)
      .select("id")
      .maybeSingle();

    if (itemUpdateError) {
      throw new OrderMutationError(itemUpdateError);
    }

    if (!updatedItem) {
      throw new OrderValidationError("수정할 주문 상품을 찾을 수 없습니다.");
    }
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      customer_name: values.customerName.trim(),
      customer_phone: values.customerPhone?.trim() || null,
      memo: values.memo?.trim() || null,
      ordered_at: getOrderedAt(values.orderedAt),
      total_amount: nextTotalAmount,
      updated_at: new Date().toISOString()
    })
    .eq("id", order.id)
    .eq("store_id", storeId)
    .select("id, status")
    .maybeSingle();

  if (updateError) {
    throw new OrderMutationError(updateError);
  }

  if (!updatedOrder) {
    throw new OrderNotFoundError();
  }

  return {
    orderId: updatedOrder.id,
    status: updatedOrder.status
  };
}

export async function updateOrderStatusesForStore(
  supabase: OrdersSupabaseClient,
  store: Store,
  values: OrderBulkStatusUpdateValues
): Promise<BulkOrderStatusUpdateResult> {
  const orderIds = [...new Set(values.orderIds)];
  const results: BulkOrderStatusUpdateResult["results"] = [];

  for (const orderId of orderIds) {
    try {
      await updateOrderStatusForStore(supabase, store, orderId, values);
      results.push({
        orderId,
        status: "updated"
      });
    } catch (error) {
      results.push({
        message: error instanceof Error ? error.message : "주문 상태를 변경하지 못했습니다.",
        orderId,
        status: "failed"
      });
    }
  }

  const updatedCount = results.filter((result) => result.status === "updated").length;

  return {
    failedCount: results.length - updatedCount,
    results,
    updatedCount
  };
}

export function isOrderSchemaMissingError(error: unknown) {
  return error instanceof OrderMutationError && isSchemaMissingError(error);
}
