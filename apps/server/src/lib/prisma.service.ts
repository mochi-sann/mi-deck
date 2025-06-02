import { PrismaClient } from "~/generated/prisma";

// NestJS の @Injectable や OnModuleInit は Hono では不要になります。
// PrismaClient を直接エクスポートするか、必要に応じてカスタムメソッドを持つクラスとして利用します。

// シンプルな PrismaClient のインスタンスをエクスポートする例
// Hono のミドルウェアでリクエストコンテキストにこのインスタンスをセットして利用することを想定します。
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// アプリケーション起動時に接続を確立したい場合は、別途その処理を呼び出す必要があります。
// PrismaClient は最初のクエリ実行時に遅延接続するため、必ずしも明示的な connect() が必要ではありません。
// async function connectPrisma() {
//   await prisma.$connect();
// }
// connectPrisma(); // 起動時に呼び出す場合

export default prisma;
