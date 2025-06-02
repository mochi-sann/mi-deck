import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { ENV } from "./lib/env";
import authRoutes from "./routes/auth";

const app = new Hono();

// Logger middleware
app.use(logger());

// Global Error Handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  // その他の予期せぬエラー
  console.error("Unhandled Error:", err);
  // 本番環境では詳細なエラーメッセージを返さないように注意
  const message =
    process.env.NODE_ENV === "production"
      ? "内部サーバーエラーが発生しました。"
      : err.message;
  return c.json(
    { message: "内部サーバーエラーが発生しました。", error: message },
    500,
  );
});

app.get("/", (c) => {
  return c.json({ message: "Hello Hono from Mi-Deck API!" });
});

// API v1 Routes
const v1 = new Hono();
v1.route("/auth", authRoutes);

app.route("/api/v1", v1);

// サーバー起動 (テスト環境では起動しない)
if (process.env.NODE_ENV !== "test") {
  console.log(`Hono server is running on http://localhost:${ENV.PORT}`);
  serve({
    fetch: app.fetch,
    port: ENV.PORT,
  });
}

export default app; // テスト用にappをエクスポート
