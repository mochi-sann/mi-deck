import { Module } from "@nestjs/common";
import { ServersessionsController } from "./server-sessions.controller";
import { ServerSessionsService } from "./server-sessions.service";

@Module({
  controllers: [ServersessionsController],
  providers: [ServerSessionsService],
})
export class ServerSessionsModule {}
