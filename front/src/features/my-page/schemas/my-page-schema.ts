import { z } from "zod";
import { salesChannels } from "@/features/stores/schemas/store-form-schema";

export const myPageFormSchema = z.object({
  displayName: z.string().trim().max(40, "이름은 40자 이하로 입력하세요.").optional(),
  storeName: z.string().trim().min(1, "스토어명을 입력하세요.").max(60, "스토어명은 60자 이하로 입력하세요."),
  businessType: z.enum(salesChannels).optional().or(z.literal("")),
  memo: z.string().trim().max(500, "메모는 500자 이하로 입력하세요.").optional()
});

export type MyPageFormValues = z.infer<typeof myPageFormSchema>;
