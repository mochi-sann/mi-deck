import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上である必要があります。" }),
  username: z
    .string()
    .min(3, { message: "ユーザー名は3文字以上である必要があります。" }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(1, { message: "パスワードを入力してください。" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
