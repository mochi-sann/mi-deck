import { PrismaClient } from "~/generated/prisma";

let prisma: PrismaClient;

declare global {
  // biome-ignore lint/style/noVar: Prismaの推奨するグローバル変数での管理方法
  var __prisma: PrismaClient | undefined;
}

// Prismaのベストプラクティスに従い、開発モードでのホットリロード時に
// PrismaClientのインスタンスが増えすぎないようにグローバル変数を使用
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      // 開発時にはクエリログなどを有効にすることも可能
      // log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

export default prisma;
