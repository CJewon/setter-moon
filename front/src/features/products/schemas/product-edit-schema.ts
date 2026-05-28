import { z } from "zod";

export const productEditSchema = z.object({
  basePrice: z.coerce.number({ error: "판매가를 입력해 주세요." }).int("판매가는 원 단위 숫자로 입력해 주세요.").min(0, "판매가는 0원 이상이어야 합니다."),
  memo: z
    .string()
    .max(500, "상품 메모는 500자 이하로 입력해 주세요.")
    .optional()
    .transform((value) => value?.trim() || undefined),
  name: z.string().trim().min(1, "상품명을 입력해 주세요.").max(80, "상품명은 80자 이하로 입력해 주세요."),
  status: z.enum(["active", "sold_out", "hidden"], { error: "판매상태를 선택해 주세요." })
});

export type ProductEditValues = z.infer<typeof productEditSchema>;
