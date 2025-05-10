import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config"; // ConfigModuleとConfigServiceをインポート
import { AuthModule } from "./apis/auth/auth.module";
import { ServerSessionsModule } from "./apis/server-sessions/server-sessions.module";
import { TimelineModule } from "./apis/timeline/timeline.module";
import { UserModule } from "./apis/user/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DrizzleService } from "./lib/drizzle.service"; // PrismaServiceの代わりにDrizzleServiceをインポート

@Module({
  imports: [
    ConfigModule.forRoot({
      // ConfigModuleをインポートして .env ファイルを読み込めるようにする
      isGlobal: true, // グローバルモジュールとして登録
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env", // 環境によって読み込む .env ファイルを切り替える場合
    }),
    UserModule,
    AuthModule,
    ServerSessionsModule,
    TimelineModule,
  ],
  controllers: [AppController],
  providers: [AppService, DrizzleService, ConfigService], // DrizzleServiceとConfigServiceをプロバイダーに追加
})
export class AppModule {}
