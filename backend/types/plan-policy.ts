export const PLAN_POLICY_VERSION = "2026-05-27";

export const PLAN_TIME_ZONE = "Asia/Seoul";

export const PLAN_IDS = {
  FREE: "free",
  PAID_FULL: "paid_full"
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

export type PlanLimit = number | null;

export type PlanLimits = {
  maxProducts: PlanLimit;
  maxSkus: PlanLimit;
  maxMonthlyOrders: PlanLimit;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  [PLAN_IDS.FREE]: {
    maxProducts: 10,
    maxSkus: 100,
    maxMonthlyOrders: 300
  },
  [PLAN_IDS.PAID_FULL]: {
    maxProducts: null,
    maxSkus: null,
    maxMonthlyOrders: null
  }
};

export const USAGE_METRIC_KEYS = {
  PRODUCTS: "products",
  SKUS: "skus",
  MONTHLY_ORDERS: "monthly_orders"
} as const;

export type UsageMetricKey = (typeof USAGE_METRIC_KEYS)[keyof typeof USAGE_METRIC_KEYS];

export const USAGE_COUNT_RULES: Record<UsageMetricKey, string> = {
  [USAGE_METRIC_KEYS.PRODUCTS]: "Count all products in the store, including active, sold_out, and hidden.",
  [USAGE_METRIC_KEYS.SKUS]: "Count all variants in the store, including active and inactive variants.",
  [USAGE_METRIC_KEYS.MONTHLY_ORDERS]: "Count orders created during the current KST calendar month."
};

export const LIMIT_ENFORCEMENT_TARGETS = {
  productCreate: [USAGE_METRIC_KEYS.PRODUCTS, USAGE_METRIC_KEYS.SKUS],
  productUpdate: [USAGE_METRIC_KEYS.SKUS],
  variantSave: [USAGE_METRIC_KEYS.SKUS],
  orderCreate: [USAGE_METRIC_KEYS.MONTHLY_ORDERS]
} as const;
