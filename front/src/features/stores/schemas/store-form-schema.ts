import { z } from "zod";

export const salesChannels = ["스마트스토어", "쿠팡", "인스타그램", "카카오톡", "오프라인", "기타"] as const;

export const storeFormSchema = z.object({
  name: z.string().trim().min(1, "스토어명을 입력하세요.").max(60, "스토어명은 60자 이하로 입력하세요."),
  businessType: z.enum(salesChannels).optional().or(z.literal("")),
  memo: z.string().trim().max(500, "메모는 500자 이하로 입력하세요.").optional()
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;
