import { Module } from "@nestjs/common";
import { PrismaService } from "~/lib/prisma.service";
import { ServersessionsController } from "./server-sessions.controller";
import { ServerSessionsService } from "./server-sessions.service";

@Module({
  controllers: [ServersessionsController],
  providers: [ServerSessionsService, PrismaService],
})
export class ServerSessionsModule {}
