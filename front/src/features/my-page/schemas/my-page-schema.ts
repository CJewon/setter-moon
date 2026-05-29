import { z } from "zod";

export const myPageAccountSchema = z.object({
  displayName: z.string().trim().max(40, "이름은 40자 이하로 입력하세요.").optional()
});

export type MyPageAccountValues = z.infer<typeof myPageAccountSchema>;
