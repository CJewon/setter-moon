export const PLAN_IDS = {
  FREE: "free",
  PAID_FULL: "paid_full"
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

export type UsageMetricKey = "products" | "skus" | "monthlyOrders";

export type UsageLimitState = "normal" | "warning" | "blocked";

export type UsageCountSnapshot = Record<UsageMetricKey, number>;

export type PlanLimit = number | null;

export type UsageMetric = {
  key: UsageMetricKey;
  label: string;
  count: number;
  limit: PlanLimit;
  percent: number | null;
  state: UsageLimitState;
};

export type UsageSummary = {
  planId: PlanId;
  metrics: UsageMetric[];
  monthRange: {
    startsAt: string;
    endsAt: string;
    timeZone: "Asia/Seoul";
  };
};

const WARNING_THRESHOLD = 0.8;

const PLAN_LIMITS: Record<PlanId, Record<UsageMetricKey, PlanLimit>> = {
  [PLAN_IDS.FREE]: {
    products: 10,
    skus: 100,
    monthlyOrders: 100
  },
  [PLAN_IDS.PAID_FULL]: {
    products: null,
    skus: null,
    monthlyOrders: null
  }
};

const METRIC_LABELS: Record<UsageMetricKey, string> = {
  products: "상품",
  skus: "옵션 조합",
  monthlyOrders: "월 새 주문"
};

export function normalizePlanId(planId: string | null | undefined): PlanId {
  return planId === PLAN_IDS.PAID_FULL ? PLAN_IDS.PAID_FULL : PLAN_IDS.FREE;
}

export function getKstMonthRange(referenceDate = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(referenceDate.getTime() + kstOffsetMs);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth();
  const startsAt = new Date(Date.UTC(year, month, 1) - kstOffsetMs);
  const endsAt = new Date(Date.UTC(year, month + 1, 1) - kstOffsetMs);

  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    timeZone: "Asia/Seoul" as const
  };
}

export function getUsageLimitState(count: number, limit: PlanLimit): UsageLimitState {
  if (limit === null) {
    return "normal";
  }

  if (count >= limit) {
    return "blocked";
  }

  return count / limit >= WARNING_THRESHOLD ? "warning" : "normal";
}

export function createUsageSummary(planIdInput: string | null | undefined, counts: UsageCountSnapshot, referenceDate = new Date()): UsageSummary {
  const planId = normalizePlanId(planIdInput);
  const limits = PLAN_LIMITS[planId];

  return {
    planId,
    metrics: (Object.keys(METRIC_LABELS) as UsageMetricKey[]).map((key) => {
      const limit = limits[key];
      const count = counts[key];

      return {
        key,
        label: METRIC_LABELS[key],
        count,
        limit,
        percent: limit === null ? null : Math.min(Math.round((count / limit) * 100), 100),
        state: getUsageLimitState(count, limit)
      };
    }),
    monthRange: getKstMonthRange(referenceDate)
  };
}
