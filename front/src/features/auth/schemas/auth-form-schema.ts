import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력하세요."),
  password: z.string().min(1, "비밀번호를 입력하세요.")
});

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이하로 입력하세요.")
  .regex(/[A-Za-z]/, "비밀번호에는 영문을 포함해 주세요.")
  .regex(/\d/, "비밀번호에는 숫자를 포함해 주세요.");

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력하세요.").max(40, "이름은 40자 이하로 입력하세요."),
    email: z.string().trim().email("올바른 이메일을 입력하세요."),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력하세요.")
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"]
  });

export const findIdSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요.").max(40, "이름은 40자 이하로 입력하세요."),
  storeName: z.string().trim().min(1, "스토어명을 입력하세요.").max(60, "스토어명은 60자 이하로 입력하세요.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력하세요.")
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type FindIdValues = z.infer<typeof findIdSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
