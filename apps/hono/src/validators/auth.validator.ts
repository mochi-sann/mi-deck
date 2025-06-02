import { z } from "zod";
import "zod-openapi/extend";

export const signUpSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" })
    .openapi({ example: "example@example.com", format: "email" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上である必要があります。" })
    .openapi({ example: "password123" }),
  username: z
    .string()
    .min(3, { message: "ユーザー名は3文字以上である必要があります。" })
    .openapi({ example: "username123" }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" })
    .openapi({ example: "example@example.com" }),
  password: z
    .string()
    .min(1, { message: "パスワードを入力してください。" })
    .openapi({ example: "password" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
