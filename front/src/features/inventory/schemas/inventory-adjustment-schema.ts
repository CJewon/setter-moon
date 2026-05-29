import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  memo: z.string().trim().min(1, "조정 사유를 입력해 주세요.").max(300, "조정 사유는 300자 이하로 입력해 주세요."),
  targetStock: z.coerce
    .number({ error: "목표 재고를 입력해 주세요." })
    .int("목표 재고는 정수로 입력해 주세요.")
    .min(0, "목표 재고는 0개 이상이어야 합니다.")
    .max(999999, "목표 재고는 999,999개 이하로 입력해 주세요."),
  variantId: z.string().uuid("재고를 조정할 옵션을 다시 선택해 주세요.")
});

export type InventoryAdjustmentValues = z.infer<typeof inventoryAdjustmentSchema>;
