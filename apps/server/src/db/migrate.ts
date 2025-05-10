import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool, Client } from 'pg';
import 'dotenv/config';
import { Logger } from '@nestjs/common'; // NestJSのLoggerを使う場合

// .envファイルから環境変数を読み込む
// process.env.NODE_ENV の値に応じて読み込む .env ファイルを切り替える場合は、
// アプリケーションのエントリーポイントや設定ファイルで集約的に管理することを推奨します。
// ここでは、 migrate.ts が実行されるコンテキストで .env が読み込まれていることを前提とします。
// もし読み込まれていない場合は、以下のコメントアウトを解除してください。
// import * as dotenv from 'dotenv';
// dotenv.config(); // apps/server/.env を参照する場合
// dotenv.config({ path: '../../.env' }); // ルートの .env を参照する場合

const logger = new Logger('MigrationScript');

async function ensureDatabaseExists(dbConfig: URL) {
  const dbName = dbConfig.pathname.slice(1); // URLのpathnameから先頭の'/'を除いたものがデータベース名
  if (!dbName) {
    logger.error('DATABASE_URL does not specify a database name.');
    process.exit(1);
  }

  // デフォルトの 'postgres' データベースに接続するための設定
  // 元の接続情報からデータベース名だけを除外（または 'postgres' に設定）
  const tempDbConfig = new URL(dbConfig.toString());
  tempDbConfig.pathname = '/postgres'; // もしくは '/template1'

  const client = new Client({
    user: tempDbConfig.username,
    password: tempDbConfig.password,
    host: tempDbConfig.hostname,
    port: Number(tempDbConfig.port) || 5432,
    database: tempDbConfig.pathname.slice(1),
  });

  try {
    await client.connect();
    logger.log(`Connected to '${tempDbConfig.pathname.slice(1)}' database to check for '${dbName}'.`);

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      logger.log(`Database '${dbName}' does not exist. Creating it...`);
      // データベース名に特殊文字が含まれる可能性を考慮し、クエリビルダやエスケープ処理が望ましいが、
      // CREATE DATABASE ではプレースホルダが使えないため、ここでは直接文字列結合する。
      // dbName のバリデーションが別途必要になる場合がある。
      await client.query(`CREATE DATABASE "${dbName}"`);
      logger.log(`Database '${dbName}' created successfully.`);
    } else {
      logger.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    logger.error(`Error during database existence check or creation for '${dbName}':`, error);
    process.exit(1);
  } finally {
    await client.end();
    logger.log(`Disconnected from '${tempDbConfig.pathname.slice(1)}' database.`);
  }
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  let dbUrl: URL;
  try {
    dbUrl = new URL(process.env.DATABASE_URL);
  } catch (error) {
    logger.error('Invalid DATABASE_URL format:', error);
    process.exit(1);
  }

  // データベースの存在確認と作成
  await ensureDatabaseExists(dbUrl);

  // マイグレーション用のPoolを作成
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // 元のDATABASE_URLを使用
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);

  logger.log('Starting migrations...');
  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' }); // drizzle.config.ts の out と合わせる
    logger.log('Migrations applied successfully!');
  } catch (error) {
    logger.error('Error applying migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
    logger.log('Database connection closed.');
  }
}

runMigrations();
