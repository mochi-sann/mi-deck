import { Module } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service"; // Corrected path if needed
import { ServersessionsController } from "./server-sessions.controller";
import { ServerSessionsRepository } from "./server-sessions.repository"; // Import the repository
import { ServerSessionsService } from "./server-sessions.service";

@Module({
  controllers: [ServersessionsController],
  // Add ServerSessionsRepository to providers. PrismaService is needed by the repository.
  providers: [ServerSessionsService, ServerSessionsRepository, PrismaService],
})
export class ServerSessionsModule {}
