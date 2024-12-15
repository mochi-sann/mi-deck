import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "./apis/auth/auth.module";
import { UserModule } from "./apis/user/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RequestLoggerMiddleware } from "./middleware/requestLogger.middleware";

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
