import type { Route } from "next";

export const routes = {
  dashboard: "/dashboard",
  products: "/products",
  newProduct: "/products/new",
  productDetail: (productId: string) => `/products/${productId}` as Route,
  productEdit: (productId: string) => `/products/${productId}/edit` as Route,
  inventory: "/inventory",
  orders: "/orders",
  newOrder: "/orders/new",
  orderDetail: (orderId: string) => `/orders/${orderId}` as Route,
  settings: "/settings",
  myPage: "/my-page"
} as const;
