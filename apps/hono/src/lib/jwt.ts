import { sign, verify } from "hono/jwt";
import { ENV } from "./env";
import type { JwtPayload } from "../types/auth.types";

export const signToken = async (payload: JwtPayload): Promise<string> => {
  const token = await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + parseExpiry(ENV.JWT_EXPIRES_IN), // expを数値(Unixタイムスタンプ)で設定
    },
    ENV.JWT_SECRET,
  );
  return token;
};

// JWT_EXPIRES_IN (例: "1h", "7d", "3600s") を秒単位の数値に変換するヘルパー
function parseExpiry(expiryString: string): number {
  const unit = expiryString.slice(-1);
  const value = parseInt(expiryString.slice(0, -1), 10);

  if (isNaN(value)) {
    // 数値のみの場合は秒として解釈
    if (expiryString === String(parseInt(expiryString, 10))) {
      return parseInt(expiryString, 10);
    }
    throw new Error(`Invalid JWT_EXPIRES_IN format: ${expiryString}`);
  }

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid time unit in JWT_EXPIRES_IN: ${unit}`);
  }
}

// hono/jwt の verify はミドルウェアとして使うことが多いので、
// ここでは主に signToken を提供します。
// verifyToken が必要な場合は以下のように実装できます。
export const verifyToken = async (
  token: string,
): Promise<JwtPayload | null> => {
  try {
    const decoded = await verify(token, ENV.JWT_SECRET);
    // NestJSのpayloadに合わせて型を調整
    if (
      !decoded ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new Error("Invalid token payload structure");
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      name:
        typeof decoded.name === "string" || decoded.name === null
          ? decoded.name
          : undefined,
    } as JwtPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
