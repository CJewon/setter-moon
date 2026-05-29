import { describe, expect, it } from "@jest/globals";
import {
  orderBulkStatusUpdateSchema,
  orderEditSchema,
  orderFormSchema,
  orderStatusUpdateSchema
} from "@/features/orders/schemas/order-form-schema";

describe("order form schema", () => {
  it("accepts a valid received order payload", () => {
    expect(
      orderFormSchema.parse({
        customerName: "테스터",
        customerPhone: "010-0000-0000",
        items: [{ quantity: 2, unitPrice: 19000, variantId: "variant-1" }],
        memo: "수동 주문"
      })
    ).toMatchObject({
      customerName: "테스터",
      items: [{ quantity: 2, unitPrice: 19000, variantId: "variant-1" }]
    });
  });

  it("rejects missing customer and invalid quantity", () => {
    const parsed = orderFormSchema.safeParse({
      customerName: "",
      items: [{ quantity: 0, unitPrice: 19000, variantId: "" }]
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts an order edit payload without product changes", () => {
    expect(
      orderEditSchema.parse({
        customerName: "수정 고객",
        customerPhone: "010-1111-2222",
        memo: "주소 확인",
        orderedAt: "2026-05-29T12:30"
      })
    ).toMatchObject({
      customerName: "수정 고객",
      customerPhone: "010-1111-2222",
      memo: "주소 확인"
    });
  });

  it("rejects an order edit payload without customer name", () => {
    const parsed = orderEditSchema.safeParse({
      customerName: "",
      memo: "확인"
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an order edit payload without ordered date", () => {
    const parsed = orderEditSchema.safeParse({
      customerName: "수정 고객",
      orderedAt: ""
    });

    expect(parsed.success).toBe(false);
  });

  it("requires a hold reservation policy when the service validates hold transitions", () => {
    expect(orderStatusUpdateSchema.parse({ holdReservationPolicy: "keep", toStatus: "hold" })).toEqual({
      holdReservationPolicy: "keep",
      toStatus: "hold"
    });
  });

  it("accepts a bulk status update payload", () => {
    const parsed = orderBulkStatusUpdateSchema.parse({
      orderIds: ["7e604de0-3b82-4174-a1ef-7c5a5ca9a681"],
      restoreStock: true,
      toStatus: "cancelled"
    });

    expect(parsed).toMatchObject({
      orderIds: ["7e604de0-3b82-4174-a1ef-7c5a5ca9a681"],
      restoreStock: true,
      toStatus: "cancelled"
    });
  });

  it("rejects a bulk status update without selected orders", () => {
    const parsed = orderBulkStatusUpdateSchema.safeParse({
      orderIds: [],
      toStatus: "shipping"
    });

    expect(parsed.success).toBe(false);
  });
});
