import { describe, expect, it } from "@jest/globals";
import { orderFormSchema, orderStatusUpdateSchema } from "@/features/orders/schemas/order-form-schema";

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

  it("requires a hold reservation policy when the service validates hold transitions", () => {
    expect(orderStatusUpdateSchema.parse({ holdReservationPolicy: "keep", toStatus: "hold" })).toEqual({
      holdReservationPolicy: "keep",
      toStatus: "hold"
    });
  });
});
