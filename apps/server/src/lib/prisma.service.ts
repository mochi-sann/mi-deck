import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "~/generated/prisma";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"] // Enable detailed logs in development
          : ["error"], // Minimal logs in other environments
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
