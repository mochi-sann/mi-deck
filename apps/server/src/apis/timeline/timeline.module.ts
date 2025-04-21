import { Module } from "@nestjs/common";
import { PrismaService } from "../../lib/prisma.service"; // Correct path if needed
import { TimelineController } from "./timeline.controller";
import { TimelineRepository } from "./timeline.repository"; // Import the repository
import { TimelineService } from "./timeline.service";

@Module({
  controllers: [TimelineController],
  // Add TimelineRepository to providers. PrismaService is needed by the repository.
  providers: [TimelineService, TimelineRepository, PrismaService],
})
export class TimelineModule {}
