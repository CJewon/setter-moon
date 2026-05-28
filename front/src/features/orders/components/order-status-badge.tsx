import type { OrderStatus } from "@/server/orders/types";
import { StatusBadge } from "@/shared/components/status-badge";
import { orderStatusLabel } from "@/shared/constants/status-labels";

const orderStatusTone: Record<OrderStatus, "danger" | "info" | "neutral" | "success" | "warning"> = {
  cancelled: "danger",
  delivered: "success",
  hold: "warning",
  ready_to_ship: "info",
  received: "neutral",
  shipping: "info"
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge tone={orderStatusTone[status]}>{orderStatusLabel[status]}</StatusBadge>;
}
