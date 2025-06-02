import * as fs from "node:fs";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJson } from "hono/pretty-json";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { dump } from "js-yaml";
import prisma from "./lib/prisma.service";
import { PORT } from "./lib/env";
import authAppRoutes from "./apis/auth/auth.routes"; // 作成した認証ルートをインポート

// OpenAPIHono を使用して、ルート定義時に OpenAPI の情報を付加できるようにします
const app = new OpenAPIHono();

// ミドルウェア
app.use("*", cors()); // CORS設定
app.use("*", prettyJson()); // JSONレスポンスを整形 (開発時に便利)

// Prisma インスタンスをコンテキストにセットするミドルウェア
app.use("*", async (c, next) => {
  c.set("prisma", prisma);
  await next();
});

// グローバルプレフィックス (NestJS の app.setGlobalPrefix("v1") に相当)
const v1App = new OpenAPIHono().basePath("/v1");

// --- ルート定義の例 ---
// NestJS の AppController/AppService の getHello に相当するルート
const helloRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
          }),
        },
      },
      description: "Successful response",
    },
  },
});

v1App.openapi(helloRoute, (c) => {
  return c.json({
    status: "ok from Hono!",
  });
});

// 認証ルートを v1App に登録
v1App.route("/auth", authAppRoutes); // "/v1/auth" としてルーティングされる

// v1App をメインアプリに登録
app.route("/", v1App);

// OpenAPI ドキュメント (JSON)
app.doc("/v1/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "mi-deck api with Hono",
    description: "mi-deck api description (powered by Hono)",
  },
  components: { // Bearer 認証の定義を追加
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Optional: JWTであることを明示
      },
    },
  },
});

// Swagger UI
app.get("/v1/api-docs", swaggerUI({ url: "/v1/openapi.json" }));

// Scalar API Reference (NestJSの scalar/nestjs-api-reference の代替)
// Hono には直接の Scalar 統合はないため、手動でHTMLを返すか、
// Scalar のCDNを利用するルートを別途作成する必要があります。
// もし Scalar を引き続き利用したい場合は、その設定方法を別途検討します。
// ここでは Swagger UI を優先しています。

// サーバー起動
const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);

    try {
      const document = app.getOpenAPIDocument({
         openapi: "3.0.0",
         info: {
           version: "1.0.0",
           title: "mi-deck API with Hono",
         },
         // v1App に登録されたルートのドキュメントを含めるために、
         // app インスタンスからドキュメントを取得します。
         // Hono のバージョンや OpenAPIHono の仕様により、
         // app.getOpenAPIDocument() が全ての登録済みルート（v1App内のものも含む）を
         // 正しく収集できることを前提としています。
       });
      fs.mkdirSync("./.swagger", { recursive: true });
      fs.writeFileSync("./.swagger/swagger-spec.yaml", dump(document, {}));
      console.log("Swagger spec written to ./.swagger/swagger-spec.yaml");
    } catch (error) {
      console.error("Failed to write Swagger spec:", error);
    }
  },
);

// Graceful shutdown (オプション)
process.on("SIGINT", async () => {
  console.log("Gracefully shutting down...");
  server.close((err) => {
    if (err) {
      console.error("Error during server close:", err);
    }
    console.log("Server closed.");
    prisma.$disconnect().then(() => {
      console.log("Prisma disconnected.");
      process.exit(0);
    }).catch(e => {
      console.error("Error during Prisma disconnect:", e);
      process.exit(1);
    });
  });
});
