import { Module } from "@nestjs/common";
import { ServerSessionsService } from "./server-sessions.service";

@Module({
  providers: [ServerSessionsService],
})
export class ServerSessionsModule {}
