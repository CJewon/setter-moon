import type { OrderStatus, ProductStatus } from "@/shared/types/domain";

export const productStatusLabel: Record<ProductStatus, string> = {
  active: "판매중",
  sold_out: "품절",
  hidden: "숨김"
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  received: "주문접수",
  ready_to_ship: "배송대기",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
  hold: "보류"
};
