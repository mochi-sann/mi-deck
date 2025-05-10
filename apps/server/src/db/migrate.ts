import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common'; // NestJSのLoggerを使う場合

// .envファイルから環境変数を読み込む
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env' }); // ルートの .env を参照する場合
// dotenv.config(); // apps/server/.env を参照する場合

const logger = new Logger('MigrationScript');

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
