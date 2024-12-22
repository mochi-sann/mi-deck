import { Module } from "@nestjs/common";
import { AuthModule } from "./apis/auth/auth.module";
import { ServerSessionsModule } from "./apis/server-sessions/server-sessions.module";
import { UserModule } from "./apis/user/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [UserModule, AuthModule, ServerSessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
