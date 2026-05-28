import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";

export type OrdersSupabaseClient = SupabaseClient<Database>;
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatusLogRow = Database["public"]["Tables"]["order_status_logs"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type HoldReservationPolicy = Database["public"]["Enums"]["hold_reservation_policy"];

export type OrderVariantChoice = {
  availableStock: number;
  currentStock: number;
  price: number;
  productId: string;
  productName: string;
  reservedQuantity: number;
  safetyStock: number;
  variantId: string;
  variantName: string;
};

export type OrderProductChoice = {
  id: string;
  name: string;
  variants: OrderVariantChoice[];
};

export type OrderListItem = Pick<
  OrderRow,
  "created_at" | "customer_name" | "id" | "order_no" | "ordered_at" | "status" | "total_amount"
> & {
  itemSummary: string;
  totalQuantity: number;
};

export type OrderDetail = OrderRow & {
  items: OrderItemRow[];
  statusLogs: OrderStatusLogRow[];
};
