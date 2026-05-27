import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "상품명을 입력하세요."),
  basePrice: z.coerce.number().min(0, "판매가는 0 이상이어야 합니다."),
  memo: z.string().optional()
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
