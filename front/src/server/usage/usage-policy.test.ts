import { describe, expect, it } from "@jest/globals";
import { createUsageSummary, getKstMonthRange, getUsageLimitState, normalizePlanId } from "@/server/usage/usage-policy";

describe("usage policy", () => {
  it("defaults unknown plans to free", () => {
    expect(normalizePlanId(null)).toBe("free");
    expect(normalizePlanId("unknown")).toBe("free");
    expect(normalizePlanId("paid_full")).toBe("paid_full");
  });

  it("marks free plan limits as normal, warning, and blocked", () => {
    expect(getUsageLimitState(7, 10)).toBe("normal");
    expect(getUsageLimitState(8, 10)).toBe("warning");
    expect(getUsageLimitState(10, 10)).toBe("blocked");
  });

  it("does not block paid full unlimited metrics", () => {
    expect(getUsageLimitState(1000, null)).toBe("normal");
  });

  it("creates usage metrics for free plan counts", () => {
    const summary = createUsageSummary(
      "free",
      {
        products: 8,
        skus: 100,
        monthlyOrders: 32
      },
      new Date("2026-05-27T05:00:00.000Z")
    );

    expect(summary.planId).toBe("free");
    expect(summary.metrics).toMatchObject([
      { key: "products", count: 8, limit: 10, percent: 80, state: "warning" },
      { key: "skus", count: 100, limit: 100, percent: 100, state: "blocked" },
      { key: "monthlyOrders", count: 32, limit: 100, percent: 32, state: "normal" }
    ]);
  });

  it("uses KST calendar month boundaries", () => {
    expect(getKstMonthRange(new Date("2026-05-27T05:00:00.000Z"))).toEqual({
      startsAt: "2026-04-30T15:00:00.000Z",
      endsAt: "2026-05-31T15:00:00.000Z",
      timeZone: "Asia/Seoul"
    });
  });
});
