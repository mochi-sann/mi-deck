import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// .envファイルから環境変数を読み込む (パスはプロジェクト構成に合わせて調整)
// ルートに .env がある場合: dotenv.config({ path: '../../.env' });
// apps/server に .env がある場合: dotenv.config();
dotenv.config(); // apps/server/.env を期待

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export default {
  schema: './src/db/schema.ts', // Drizzleスキーマファイルのパス (後で作成)
  out: './drizzle/migrations',  // マイグレーションファイルの出力ディレクトリ
  dialect: 'postgresql',        // 使用するDBの種類 (Prismaのpostgresqlに対応)
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true, // マイグレーション生成時に詳細情報を表示
  strict: true,  // 型チェックを厳密に行う
} satisfies Config;
