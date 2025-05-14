import { Module } from "@nestjs/common";
import { PostgresJSDialect } from "kysely-postgres-js";
import { KyselyModule } from "nestjs-kysely";
import postgres from "postgres";
import { AuthModule } from "./apis/auth/auth.module";
import { ServerSessionsModule } from "./apis/server-sessions/server-sessions.module";
import { TimelineModule } from "./apis/timeline/timeline.module";
import { UserModule } from "./apis/user/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    UserModule,
    AuthModule,
    ServerSessionsModule,
    TimelineModule,
    KyselyModule.forRoot({
      dialect: new PostgresJSDialect({
        postgres: postgres(process.env.DATABASE_URL, {
          host: "", // Postgres ip address[s] or domain name[s]
          database: "", // Name of database to connect to
          username: "", // Username of database user
          password: "", // Password of database user
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
