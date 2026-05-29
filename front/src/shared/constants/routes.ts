import type { Route } from "next";

export const routes = {
  signIn: "/sign-in" as Route,
  signUp: "/sign-up" as Route,
  findId: "/find-id" as Route,
  forgotPassword: "/forgot-password" as Route,
  dashboard: "/dashboard",
  products: "/products",
  newProduct: "/products/new",
  productDetail: (productId: string) => `/products/${productId}` as Route,
  productEdit: (productId: string) => `/products/${productId}/edit` as Route,
  inventory: "/inventory",
  inventoryLowStock: "/inventory/low-stock",
  inventoryMovements: "/inventory/movements",
  orders: "/orders",
  newOrder: "/orders/new",
  orderDetail: (orderId: string) => `/orders/${orderId}` as Route,
  orderEdit: (orderId: string) => `/orders/${orderId}/edit` as Route,
  settings: "/settings",
  myPage: "/my-page"
} as const;
