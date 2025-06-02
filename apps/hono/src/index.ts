import { serve } from "@hono/node-server";
import { z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ENV } from "./lib/env";
import authRoutes from "./routes/auth";
import "zod-openapi/extend";

// const app = new OpenAPIHono();
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
const OPENAPI_JSON_PATH = "/openapi/json";

app.get(
  OPENAPI_JSON_PATH,
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono",
        version: "1.0.0",
        description: "API for greeting an creating users",
      },
      servers: [
        {
          url: "http://localhost:3001",
          description: "Local server",
        },
      ],
    },
    defaultOptions: {
      // biome-ignore lint/style/useNamingConvention:
      GET: {
        responses: {
          400: {
            description: "Zod Error",
            content: {
              "application/json": {
                schema: resolver(
                  z.object({
                    status: z.literal(400),
                    message: z.string(),
                  }),
                ),
              },
            },
          },
        },
      },
    },
  }),
);
app.get(
  "/openapi",
  Scalar({
    theme: "saturn",
    spec: {
      url: OPENAPI_JSON_PATH,
    },
  }),
);
// サーバー起動 (テスト環境では起動しない)
if (process.env.NODE_ENV !== "test") {
  console.log(`Hono server is running on http://localhost:${ENV.PORT}`);
  serve({
    fetch: app.fetch,
    port: ENV.PORT,
  });
}

export default app; // テスト用にappをエクスポート
