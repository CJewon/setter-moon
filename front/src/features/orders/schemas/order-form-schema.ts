import { z } from "zod";

export const orderFormSchema = z.object({
  customerName: z.string().min(1, "고객명을 입력하세요."),
  customerPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
        unitPrice: z.coerce.number().min(0)
      })
    )
    .min(1, "주문 상품을 1개 이상 선택하세요."),
  memo: z.string().optional()
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
