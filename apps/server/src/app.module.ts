import { Module } from "@nestjs/common";
import { AuthModule } from "./apis/auth/auth.module.js";
import { ServerSessionsModule } from "./apis/server-sessions/server-sessions.module.js";
import { UserModule } from "./apis/user/user.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

@Module({
  imports: [UserModule, AuthModule, ServerSessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
