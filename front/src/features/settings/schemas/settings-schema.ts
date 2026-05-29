import { z } from "zod";
import { salesChannels } from "@/features/stores/schemas/store-form-schema";

export const settingsFormSchema = z.object({
  storeName: z.string().trim().min(1, "스토어명을 입력하세요.").max(60, "스토어명은 60자 이하로 입력하세요."),
  businessType: z.enum(salesChannels).optional().or(z.literal("")),
  memo: z.string().trim().max(500, "운영 메모는 500자 이하로 입력하세요.").optional()
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
