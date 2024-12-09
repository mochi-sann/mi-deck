import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";

const jwtSecret = "your-jwt-secret"; // 環境変数で管理

export const authMiddleware: MiddlewareHandler = (ctx, next) => {
  const authHeader = ctx.req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ctx.text("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    ctx.set("user", decoded); // ユーザー情報を保存
    return next();
  } catch {
    return ctx.text("Invalid or expired token", 401);
  }
};
