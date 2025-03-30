import { execSync } from "node:child_process";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * VITEST_POOL_ID毎にDatabaseを作成し、データのリセット処理を行う。
 */
export async function setupDatabase() {
  // 作成するDB名
  const newDbName = `worker_${process.env.VITEST_POOL_ID}`;

  // DBの作成
  const prisma = new PrismaClient();
  await prisma.$connect();
  try {
    const query = `CREATE DATABASE ${newDbName};`;
    await prisma.$queryRaw`${Prisma.raw(query)}`;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // DB作成済みだった場合は無視
      // 本来はここでエラーコードをチェックした方が良い。今回は割愛
    } else {
      throw error;
    }
  }
  await prisma.$disconnect();

  console.log(`DB Created: ${newDbName}`);

  // 環境変数上書き
  const dbUrl = new URL(process.env.DATABASE_URL ?? "");
  const baseUrl = dbUrl.href.substring(0, dbUrl.href.lastIndexOf("/"));
  process.env.DATABASE_URL = `${baseUrl}/${newDbName}`;

  // DB初期化処理
  execSync("npx prisma migrate reset --force", {
    env: {
      ...process.env,
    },
  });

  execSync("npx prisma db push", {
    env: {
      ...process.env,
    },
  });

  console.log("DB Setup End");
}
