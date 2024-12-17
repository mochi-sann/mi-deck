// 環境変数の読み込み

import { createRoute } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { jwt } from "hono/jwt";
import jwtLib from "jsonwebtoken";
import { z } from "zod";

const AuthRoute = new Hono();

// JWTシークレットキーの取得
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

// JWTミドルウェアの設定
AuthRoute.use("/protected/*", jwt({ secret: JWT_SECRET }));

const LoginBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

const LoginResponseSchema = z.object({
  token: z.string(),
});
export const getTasksRoute = createRoute({
  path: "/",
  method: "post",
  description: "lgoin",
  request: {
    body: {
      content: { "application/json": { schema: LoginBodySchema } },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
    401: {
      description: "Internal Server Error",
      content: {
        "application/json": { schema: LoginResponseSchema },
      },
    },
  },
});

// トークンの発行エンドポイント
AuthRoute.post(
  "/login",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(LoginResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", LoginBodySchema),
  async (c) => {
    const { email, password } = c.req.json();
    console.log(
      ...[{ email, password }, "👀 [auth.ts:48]: {email , password}"].reverse(),
    );

    // ユーザーの認証ロジックをここに追加
    // 例として、メールとパスワードが正しいと仮定します
    if (email === "user@example.com" && password === "password123") {
      // JWTペイロードの定義
      const payload = {
        email,
        role: "user",
      };

      // トークンの生成
      const token = jwtLib.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      return c.json({ token });
    }

    return c.json({ message: "Invalid email or password" }, 401);
  },
);

// 保護されたルートの例
AuthRoute.get("/protected/hello", (c) => {
  // JWTトークンからデコードされたペイロードにアクセス
  const user = c.req.user as { email: string; role: string };
  return c.json({ message: `Hello, ${user.email}!`, role: user.role });
});

// 公開ルート
AuthRoute.get("/", (c) => {
  return c.json({ message: "Hello, world!" });
});

// サーバーの起動
export { AuthRoute };
