export type ProductStatus = "active" | "sold_out" | "hidden";

export type OrderStatus = "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";

export type StockMovementType = "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";

export type HoldReservationPolicy = "keep" | "release";
