import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { ENV } from "../lib/env";
import type { JwtPayload } from "../types/auth.types";
import { HTTPException } from "hono/http-exception";

export const authMiddleware = createMiddleware<{
  Variables: { user: JwtPayload };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "認証トークンが必要です。" });
  }

  const token = authHeader.substring(7); // "Bearer " の部分を除去

  try {
    const decodedPayload = await verify(token, ENV.JWT_SECRET);
    // NestJSのpayloadに合わせて型を調整・検証
    if (
      !decodedPayload ||
      typeof decodedPayload.sub !== "string" ||
      typeof decodedPayload.email !== "string"
      // decodedPayload.name は optional or null なので、存在チェックは必須ではない
    ) {
      throw new Error("Invalid token payload structure");
    }
    // exp の検証は hono/jwt の verify が自動で行う

    c.set("user", {
      sub: decodedPayload.sub,
      email: decodedPayload.email,
      name:
        typeof decodedPayload.name === "string" || decodedPayload.name === null
          ? decodedPayload.name
          : undefined,
    } as JwtPayload);
  } catch (error) {
    console.error("JWT Error:", error);
    let message = "認証に失敗しました。";
    if (error instanceof Error && error.message.includes("expired")) {
      message = "トークンの有効期限が切れています。";
    } else if (error instanceof Error && error.message.includes("invalid")) {
      message = "無効なトークンです。";
    }
    throw new HTTPException(401, { message });
  }
  await next();
});
