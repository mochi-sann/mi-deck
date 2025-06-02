import { z } from "@hono/zod-openapi";

// LoginDto に対応
export const LoginSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(1, { message: "パスワードを入力してください。" }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// SignUpDto に対応
export const SignUpSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }), // 例: 最低文字数を追加
  username: z.string().min(1, { message: "ユーザー名を入力してください。" }),
});
export type SignUpInput = z.infer<typeof SignUpSchema>;

// LoginEntity に対応
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
});

// MeEntity に対応
export const MeResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

// エラーレスポンスの共通スキーマ (任意)
export const ErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
});
