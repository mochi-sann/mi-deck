import { Module } from "@nestjs/common";
import { PrismaService } from "~/lib/prisma.service.js";
import { ServersessionsController } from "./server-sessions.controller.js";
import { ServerSessionsService } from "./server-sessions.service.js";

@Module({
  controllers: [ServersessionsController],
  providers: [ServerSessionsService, PrismaService],
})
export class ServerSessionsModule {}
