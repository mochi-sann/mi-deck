import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema"; // Drizzleスキーマ (後で作成)

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>("DATABASE_URL");
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not configured in environment variables.",
      );
    }
    this.pool = new Pool({
      connectionString,
      // SSL設定など、必要に応じて追加
      // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    this.db = drizzle(this.pool, {
      schema,
      logger: process.env.NODE_ENV === "development",
    }); // 開発環境ではクエリログを有効化
  }

  async onModuleInit() {
    try {
      await this.pool.connect();
      this.logger.log("PostgreSQL Pool connected successfully.");
    } catch (error) {
      this.logger.error("Failed to connect PostgreSQL Pool:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
      this.logger.log("PostgreSQL Pool disconnected successfully.");
    } catch (error) {
      this.logger.error("Failed to disconnect PostgreSQL Pool:", error);
    }
  }
}
