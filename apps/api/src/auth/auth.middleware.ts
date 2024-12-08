import type { MiddlewareHandler } from "hono";
import { AuthService } from "./auth.service.js";

export const authMiddleware: MiddlewareHandler = (ctx, next) => {
  const authService = new AuthService();
  const authHeader = ctx.req.header.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ctx.text("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = authService.verifyToken(token);

  if (!payload) {
    return ctx.text("Invalid or expired token", 401);
  }

  // トークン情報をリクエストコンテキストに保存
  ctx.set("user", payload);

  return next();
};
