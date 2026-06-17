export const queryKeys = {
  currentStore: ["current-store"] as const,
  dashboard: ["dashboard"] as const,
  inventory: ["inventory"] as const,
  inventoryLowStock: ["inventory-low-stock"] as const,
  inventoryMovements: ["inventory-movements"] as const,
  myPage: ["my-page"] as const,
  orderBase: ["order"] as const,
  order: (orderId: string) => ["order", orderId] as const,
  orderProductChoices: ["order-product-choices"] as const,
  orders: ["orders"] as const,
  products: ["products"] as const,
  product: (productId: string) => ["product", productId] as const,
  session: ["session"] as const,
  settings: ["settings"] as const,
  usageSummary: ["usage-summary"] as const
};
