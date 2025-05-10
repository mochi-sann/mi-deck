import { execSync } from "node:child_process";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

/**
 * VITEST_POOL_ID毎にDatabaseを作成し、データのリセット処理を行う。
 */
export async function setupDatabase() {
  // 作成するDB名
  const newDbName = `worker_${process.env.VITEST_POOL_ID}`;
  // .env.test からベースのDATABASE_URLを読み込むことを推奨
  // 例: DATABASE_URL_BASE="postgresql://user:password@host:port"
  // このURLに newDbName を結合する
  dotenv.config({ path: '.env.test' }); // テスト用の .env ファイルを読み込む

  const originalDbUrl = process.env.DATABASE_URL_ORIGINAL || process.env.DATABASE_URL; // 元のDB URLを保持
  if (!originalDbUrl) {
    console.error("DATABASE_URL_ORIGINAL or DATABASE_URL must be set in .env.test");
    process.exit(1);
  }

  const dbUrlParts = new URL(originalDbUrl);
  const baseUrl = `${dbUrlParts.protocol}//${dbUrlParts.username}:${dbUrlParts.password}@${dbUrlParts.host}:${dbUrlParts.port}`;
  const maintenanceDbUrl = `${baseUrl}/postgres`; // または他の既存のDB

  // DBの作成
  const pool = new Pool({ connectionString: maintenanceDbUrl });
  const tempDb = drizzle(pool);

  try {
    // 既存のDBを削除 (冪等性を高めるため)
    await tempDb.execute(sql.raw(`DROP DATABASE IF EXISTS "${newDbName}" WITH (FORCE);`));
    console.log(`Database ${newDbName} dropped if existed.`);
    await tempDb.execute(sql.raw(`CREATE DATABASE "${newDbName}";`));
    console.log(`Database ${newDbName} created.`);
  } catch (error) {
    console.error(`Failed to create database ${newDbName}:`, error);
    await pool.end();
    throw error;
  }
  await pool.end();

  // 環境変数上書き (テストプロセス用に新しいDBのURLを設定)
  const testDbUrl = `${baseUrl}/${newDbName}`;
  process.env.DATABASE_URL = testDbUrl;
  console.log(`DATABASE_URL set to: ${testDbUrl}`);

  // マイグレーションの実行
  const testPool = new Pool({ connectionString: testDbUrl });
  const dbForMigration = drizzle(testPool);
  try {
    console.log("Applying migrations to test database...");
    await migrate(dbForMigration, { migrationsFolder: './drizzle/migrations' }); // drizzle.config.ts の out と合わせる
    console.log("Migrations applied successfully to test database.");
  } catch (error) {
    console.error("Error applying migrations to test database:", error);
    await testPool.end();
    throw error;
  }
  await testPool.end();

  // Seed the database for testing
  console.log("Seeding test database...");
  execSync("pnpm run db:seed:test", { // package.jsonのスクリプト経由で実行
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl, // 明示的に渡す
    },
    stdio: "inherit",
  });
  console.log("Test database seeded.");

  // Add small delay to ensure Prisma client is ready
  // Drizzleでは通常不要だが、DB操作が非同期で完了するのを待つために残しても良い
  // await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("DB Setup End");
}

// Execute the setup function when this file is run by Vitest
// setupDatabase(); // Vitestの設定ファイル (vitest.config.e2e.ts) の globalSetup で呼び出すように変更
