import { z } from "zod";

const orderItemSchema = z.object({
  quantity: z.coerce.number().int("수량은 숫자로 입력해 주세요.").min(1, "수량은 1개 이상 입력해 주세요."),
  unitPrice: z.coerce.number().int("판매가는 숫자로 입력해 주세요.").min(0, "판매가는 0원 이상 입력해 주세요."),
  variantId: z.string().min(1, "주문할 옵션 조합을 선택해 주세요.")
});

export const orderFormSchema = z.object({
  customerName: z.string().trim().min(1, "고객명을 입력해 주세요.").max(40, "고객명은 40자 이하로 입력해 주세요."),
  customerPhone: z.string().trim().max(30, "연락처는 30자 이하로 입력해 주세요.").optional(),
  items: z.array(orderItemSchema).min(1, "주문할 상품과 옵션 조합을 선택해 주세요."),
  memo: z.string().trim().max(500, "메모는 500자 이하로 입력해 주세요.").optional(),
  orderedAt: z.string().optional()
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const orderEditSchema = z.object({
  customerName: z.string().trim().min(1, "고객명을 입력해 주세요.").max(40, "고객명은 40자 이하로 입력해 주세요."),
  customerPhone: z.string().trim().max(30, "연락처는 30자 이하로 입력해 주세요.").optional(),
  memo: z.string().trim().max(500, "메모는 500자 이하로 입력해 주세요.").optional(),
  orderedAt: z
    .string()
    .trim()
    .min(1, "주문일을 입력해 주세요.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "주문일을 다시 확인해 주세요.")
    .optional()
});

export type OrderEditValues = z.infer<typeof orderEditSchema>;

export const orderStatusUpdateSchema = z.object({
  holdReservationPolicy: z.enum(["keep", "release"]).optional(),
  memo: z.string().trim().max(300, "상태 변경 메모는 300자 이하로 입력해 주세요.").optional(),
  restoreStock: z.boolean().optional(),
  toStatus: z.enum(["ready_to_ship", "shipping", "delivered", "cancelled", "hold"])
});

export type OrderStatusUpdateValues = z.infer<typeof orderStatusUpdateSchema>;

export const orderBulkStatusUpdateSchema = orderStatusUpdateSchema.extend({
  orderIds: z
    .array(z.string().uuid("주문을 다시 선택해 주세요."))
    .min(1, "상태를 변경할 주문을 선택해 주세요.")
    .max(50, "한 번에 변경할 주문은 50건 이하로 선택해 주세요.")
});

export type OrderBulkStatusUpdateValues = z.infer<typeof orderBulkStatusUpdateSchema>;
