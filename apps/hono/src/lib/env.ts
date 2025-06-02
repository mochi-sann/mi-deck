import { z } from 'zod';
import dotenv from 'dotenv';

// .envファイルを読み込む (NODE_ENVに応じて.env.developmentなども読み込めるように拡張可能)
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"), // 例: "1h", "7d", "3600s"
  // 必要に応じて他の環境変数を追加
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const ENV = parsedEnv.data;
