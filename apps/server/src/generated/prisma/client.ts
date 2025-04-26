/**
 * Client
 */

import * as path from "node:path";
import * as process from "node:process";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/library";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model UserSetting
 *
 */
export type UserSetting =
  runtime.Types.Result.DefaultSelection<Prisma.$UserSettingPayload>;
/**
 * Model ServerSession
 *
 */
export type ServerSession =
  runtime.Types.Result.DefaultSelection<Prisma.$ServerSessionPayload>;
/**
 * Model ServerInfo
 *
 */
export type ServerInfo =
  runtime.Types.Result.DefaultSelection<Prisma.$ServerInfoPayload>;
/**
 * Model UserInfo
 *
 */
export type UserInfo =
  runtime.Types.Result.DefaultSelection<Prisma.$UserInfoPayload>;
/**
 * Model Panel
 *
 */
export type Panel = runtime.Types.Result.DefaultSelection<Prisma.$PanelPayload>;
/**
 * Model Timeline
 *
 */
export type Timeline =
  runtime.Types.Result.DefaultSelection<Prisma.$TimelinePayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER",
  } as const;

  export type UserRole = (typeof UserRole)[keyof typeof UserRole];

  export const ServerType = {
    Misskey: "Misskey",
    OtherServer: "OtherServer",
  } as const;

  export type ServerType = (typeof ServerType)[keyof typeof ServerType];

  export const TimelineType = {
    HOME: "HOME",
    LOCAL: "LOCAL",
    GLOBAL: "GLOBAL",
    LIST: "LIST",
    USER: "USER",
    CHANNEL: "CHANNEL",
  } as const;

  export type TimelineType = (typeof TimelineType)[keyof typeof TimelineType];
}

export type UserRole = $Enums.UserRole;

export const UserRole = $Enums.UserRole;

export type ServerType = $Enums.ServerType;

export const ServerType = $Enums.ServerType;

export type TimelineType = $Enums.TimelineType;

export const TimelineType = $Enums.TimelineType;

/**
 * Create the Client
 */
const config: runtime.GetPrismaClientConfig = {
  generator: {
    name: "client",
    provider: {
      fromEnvVar: null,
      value: "prisma-client",
    },
    output: {
      value:
        "/home/mochi/codespace/github.com/mochi-sann/mi-deck/apps/server/src/generated/prisma",
      fromEnvVar: null,
    },
    config: {
      moduleFormat: "esm",
      engineType: "library",
    },
    binaryTargets: [
      {
        fromEnvVar: null,
        value: "debian-openssl-3.0.x",
        native: true,
      },
    ],
    previewFeatures: [],
    sourceFilePath:
      "/home/mochi/codespace/github.com/mochi-sann/mi-deck/apps/server/prisma/schema.prisma",
    isCustomOutput: true,
  },
  relativePath: "../../../prisma",
  clientVersion: "6.6.0",
  engineVersion: "f676762280b54cd07c770017ed3711ddde35f37a",
  datasourceNames: ["db"],
  activeProvider: "postgresql",
  postinstall: false,
  inlineDatasources: {
    db: {
      url: {
        fromEnvVar: "DATABASE_URL",
        value: null,
      },
    },
  },
  inlineSchema:
    '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider     = "prisma-client" // no `-js` at the end\n  output       = "../src/generated/prisma" // `output` is required\n  moduleFormat = "esm" // or `"cjs"` for CommonJS\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator markdown {\n  provider = "prisma-markdown"\n  output   = "./ERD.md"\n  title    = "prisma schema"\n}\n\ngenerator dbml {\n  provider = "prisma-dbml-generator"\n}\n\nenum UserRole {\n  ADMIN\n  USER\n}\n\nmodel User {\n  id            String          @id @default(uuid())\n  email         String          @unique\n  name          String?\n  password      String\n  createdAt     DateTime        @default(now()) @map("created_at")\n  updatedAt     DateTime        @updatedAt @map("updated_at")\n  serverSession ServerSession[]\n  userSettings  UserSetting[]\n  userRole      UserRole        @default(USER) @map("user_role")\n  userInfo      UserInfo[]\n\n  @@map("user")\n}\n\nmodel UserSetting {\n  id        String   @id @default(uuid())\n  userId    String   @map("user_id")\n  user      User     @relation(fields: [userId], references: [id])\n  key       String\n  value     String\n  createdAt DateTime @default(now()) @map("created_at")\n  updatedAt DateTime @updatedAt @map("updated_at")\n\n  @@index([userId])\n  @@map("user_setting")\n}\n\nenum ServerType {\n  Misskey\n  OtherServer // 将来のサーバータイプを追加\n}\n\nmodel ServerSession {\n  id             String      @id @default(uuid())\n  userId         String      @map("user_id")\n  user           User        @relation(fields: [userId], references: [id])\n  origin         String // 修正されたフィールド名\n  serverToken    String      @map("server_token")\n  serverType     ServerType  @map("server_type")\n  createdAt      DateTime    @default(now()) @map("created_at")\n  updatedAt      DateTime    @updatedAt @map("updated_at")\n  panels         Panel[]\n  serverInfo     ServerInfo?\n  serverUserInfo UserInfo?\n  Timeline       Timeline[]\n\n  @@unique([origin, userId])\n  @@index([userId])\n  @@map("server_session")\n}\n\nmodel ServerInfo {\n  id              String        @id @default(uuid())\n  serverSessionId String        @unique @map("server_session_id")\n  serverSession   ServerSession @relation(fields: [serverSessionId], references: [id])\n  name            String\n  // softwareName    String?        @map("software_name")\n  // softwareVersion String?        @map("software_version")\n  iconUrl         String        @map("icon_url")\n  faviconUrl      String        @map("favicon_url")\n  themeColor      String        @map("theme_color")\n  createdAt       DateTime      @default(now()) @map("created_at")\n  updatedAt       DateTime      @updatedAt @map("updated_at")\n\n  @@index([serverSessionId])\n  @@map("server_info")\n}\n\nmodel UserInfo {\n  id              String        @id @default(uuid())\n  name            String\n  username        String\n  avatarUrl       String        @map("avater_url")\n  createdAt       DateTime      @default(now()) @map("created_at")\n  updatedAt       DateTime      @updatedAt @map("updated_at")\n  serverSession   ServerSession @relation(fields: [serverSEssionId], references: [id])\n  serverSEssionId String        @unique @map("server_s_ession_id")\n  User            User?         @relation(fields: [userId], references: [id])\n  userId          String?\n\n  @@index([serverSEssionId])\n  @@map("user_info")\n}\n\nmodel Panel {\n  id              String        @id @default(uuid())\n  serverSessionId String        @map("server_session_id")\n  serverSession   ServerSession @relation(fields: [serverSessionId], references: [id])\n  type            String\n\n  @@index([serverSessionId])\n  @@map("panel")\n}\n\nenum TimelineType {\n  HOME\n  LOCAL\n  GLOBAL\n  LIST\n  USER\n  CHANNEL // Misskeyのチャンネル用\n}\n\nmodel Timeline {\n  id              String        @id @default(uuid())\n  serverSessionId String        @map("server_session_id")\n  serverSession   ServerSession @relation(fields: [serverSessionId], references: [id], onDelete: Cascade) // onDeleteを追加してセッション削除時にタイムラインも削除\n  name            String\n  type            TimelineType\n  listId          String?       @map("list_id") // LISTタイプの場合に使用\n  channelId       String?       @map("channel_id") // CHANNELタイプの場合に使用\n  createdAt       DateTime      @default(now()) @map("created_at")\n  updatedAt       DateTime      @updatedAt @map("updated_at")\n\n  @@index([serverSessionId])\n  @@map("timeline")\n}\n',
  inlineSchemaHash:
    "13212b68119f14f7488c3961fd27480400f0d123bc3d6cd236a5c7608fa951d4",
  copyEngine: true,
  runtimeDataModel: {
    models: {},
    enums: {},
    types: {},
  },
  dirname: "",
};
config.dirname = __dirname;

config.runtimeDataModel = JSON.parse(
  '{"models":{"User":{"dbName":"user","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"password","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","dbName":"created_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","dbName":"updated_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"serverSession","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerSession","nativeType":null,"relationName":"ServerSessionToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"userSettings","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"UserSetting","nativeType":null,"relationName":"UserToUserSetting","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"userRole","dbName":"user_role","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"UserRole","nativeType":null,"default":"USER","isGenerated":false,"isUpdatedAt":false},{"name":"userInfo","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"UserInfo","nativeType":null,"relationName":"UserToUserInfo","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"UserSetting":{"dbName":"user_setting","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","dbName":"user_id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"UserToUserSetting","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"key","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"value","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","dbName":"created_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","dbName":"updated_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ServerSession":{"dbName":"server_session","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","dbName":"user_id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ServerSessionToUser","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"origin","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"serverToken","dbName":"server_token","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"serverType","dbName":"server_type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","dbName":"created_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","dbName":"updated_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"panels","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Panel","nativeType":null,"relationName":"PanelToServerSession","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"serverInfo","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerInfo","nativeType":null,"relationName":"ServerInfoToServerSession","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"serverUserInfo","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"UserInfo","nativeType":null,"relationName":"ServerSessionToUserInfo","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"Timeline","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Timeline","nativeType":null,"relationName":"ServerSessionToTimeline","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["origin","userId"]],"uniqueIndexes":[{"name":null,"fields":["origin","userId"]}],"isGenerated":false},"ServerInfo":{"dbName":"server_info","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"serverSessionId","dbName":"server_session_id","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"serverSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerSession","nativeType":null,"relationName":"ServerInfoToServerSession","relationFromFields":["serverSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"iconUrl","dbName":"icon_url","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"faviconUrl","dbName":"favicon_url","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"themeColor","dbName":"theme_color","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","dbName":"created_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","dbName":"updated_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"UserInfo":{"dbName":"user_info","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"username","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"avatarUrl","dbName":"avater_url","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","dbName":"created_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","dbName":"updated_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"serverSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerSession","nativeType":null,"relationName":"ServerSessionToUserInfo","relationFromFields":["serverSEssionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"serverSEssionId","dbName":"server_s_ession_id","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"User","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"UserToUserInfo","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Panel":{"dbName":"panel","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"serverSessionId","dbName":"server_session_id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"serverSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerSession","nativeType":null,"relationName":"PanelToServerSession","relationFromFields":["serverSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Timeline":{"dbName":"timeline","schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"serverSessionId","dbName":"server_session_id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"serverSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServerSession","nativeType":null,"relationName":"ServerSessionToTimeline","relationFromFields":["serverSessionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimelineType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"listId","dbName":"list_id","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"channelId","dbName":"channel_id","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","dbName":"created_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","dbName":"updated_at","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{"UserRole":{"values":[{"name":"ADMIN","dbName":null},{"name":"USER","dbName":null}],"dbName":null},"ServerType":{"values":[{"name":"Misskey","dbName":null},{"name":"OtherServer","dbName":null}],"dbName":null},"TimelineType":{"values":[{"name":"HOME","dbName":null},{"name":"LOCAL","dbName":null},{"name":"GLOBAL","dbName":null},{"name":"LIST","dbName":null},{"name":"USER","dbName":null},{"name":"CHANNEL","dbName":null}],"dbName":null}},"types":{}}',
);
config.engineWasm = undefined;
config.compilerWasm = undefined;

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(
  process.cwd(),
  "src/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node",
);
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma/schema.prisma");

interface PrismaClientConstructor {
  /**
   * ## Prisma Client
   *
   * Type-safe database client for TypeScript
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */
  new <
    ClientOptions extends
      Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
    U = "log" extends keyof ClientOptions
      ? ClientOptions["log"] extends Array<
          Prisma.LogLevel | Prisma.LogDefinition
        >
        ? Prisma.GetEvents<ClientOptions["log"]>
        : never
      : never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  >(
    options?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  ): PrismaClient<ClientOptions, U, ExtArgs>;
}

/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export interface PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = "log" extends keyof ClientOptions
    ? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions["log"]>
      : never
    : never,
  ExtArgs extends
    runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
> {
  [k: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends "query" ? Prisma.QueryEvent : Prisma.LogEvent,
    ) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): runtime.Types.Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): runtime.Types.Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => runtime.Types.Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): runtime.Types.Utils.JsPromise<R>;

  $extends: runtime.Types.Extensions.ExtendsHook<
    "extends",
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    runtime.Types.Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userSetting`: Exposes CRUD operations for the **UserSetting** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more UserSettings
   * const userSettings = await prisma.userSetting.findMany()
   * ```
   */
  get userSetting(): Prisma.UserSettingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.serverSession`: Exposes CRUD operations for the **ServerSession** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more ServerSessions
   * const serverSessions = await prisma.serverSession.findMany()
   * ```
   */
  get serverSession(): Prisma.ServerSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.serverInfo`: Exposes CRUD operations for the **ServerInfo** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more ServerInfos
   * const serverInfos = await prisma.serverInfo.findMany()
   * ```
   */
  get serverInfo(): Prisma.ServerInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userInfo`: Exposes CRUD operations for the **UserInfo** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more UserInfos
   * const userInfos = await prisma.userInfo.findMany()
   * ```
   */
  get userInfo(): Prisma.UserInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.panel`: Exposes CRUD operations for the **Panel** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Panels
   * const panels = await prisma.panel.findMany()
   * ```
   */
  get panel(): Prisma.PanelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.timeline`: Exposes CRUD operations for the **Timeline** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Timelines
   * const timelines = await prisma.timeline.findMany()
   * ```
   */
  get timeline(): Prisma.TimelineDelegate<ExtArgs, ClientOptions>;
}

export const PrismaClient = runtime.getPrismaClient(
  config,
) as unknown as PrismaClientConstructor;

export namespace Prisma {
  export type DMMF = typeof runtime.DMMF;

  export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export const validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */

  export const PrismaClientKnownRequestError =
    runtime.PrismaClientKnownRequestError;
  export type PrismaClientKnownRequestError =
    runtime.PrismaClientKnownRequestError;

  export const PrismaClientUnknownRequestError =
    runtime.PrismaClientUnknownRequestError;
  export type PrismaClientUnknownRequestError =
    runtime.PrismaClientUnknownRequestError;

  export const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;

  export const PrismaClientInitializationError =
    runtime.PrismaClientInitializationError;
  export type PrismaClientInitializationError =
    runtime.PrismaClientInitializationError;

  export const PrismaClientValidationError =
    runtime.PrismaClientValidationError;
  export type PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export const sql = runtime.sqltag;
  export const empty = runtime.empty;
  export const join = runtime.join;
  export const raw = runtime.raw;
  export const Sql = runtime.Sql;
  export type Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export const Decimal = runtime.Decimal;
  export type Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export type Extension = runtime.Types.Extensions.UserArgs;
  export const getExtensionContext = runtime.Extensions.getExtensionContext;
  export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<
    T,
    F
  >;
  export type Payload<
    T,
    F extends runtime.Operation = never,
  > = runtime.Types.Public.Payload<T, F>;
  export type Result<
    T,
    A,
    F extends runtime.Operation,
  > = runtime.Types.Public.Result<T, A, F>;
  export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;

  export type PrismaVersion = {
    client: string;
    engine: string;
  };

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export const prismaVersion: PrismaVersion = {
    client: "6.6.0",
    engine: "f676762280b54cd07c770017ed3711ddde35f37a",
  };

  /**
   * Utility Types
   */

  export type JsonObject = runtime.JsonObject;
  export type JsonArray = runtime.JsonArray;
  export type JsonValue = runtime.JsonValue;
  export type InputJsonObject = runtime.InputJsonObject;
  export type InputJsonArray = runtime.InputJsonArray;
  export type InputJsonValue = runtime.InputJsonValue;

  export const NullTypes = {
    DbNull: runtime.objectEnumValues.classes.DbNull as new (
      secret: never,
    ) => typeof runtime.objectEnumValues.instances.DbNull,
    JsonNull: runtime.objectEnumValues.classes.JsonNull as new (
      secret: never,
    ) => typeof runtime.objectEnumValues.instances.JsonNull,
    AnyNull: runtime.objectEnumValues.classes.AnyNull as new (
      secret: never,
    ) => typeof runtime.objectEnumValues.instances.AnyNull,
  };

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull = runtime.objectEnumValues.instances.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull = runtime.objectEnumValues.instances.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull = runtime.objectEnumValues.instances.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type PrismaPick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? "Please either choose `select` or `include`."
    : T extends SelectAndOmit
      ? "Please either choose `select` or `omit`."
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type Xor<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T> = T extends Array<any>
    ? False
    : T extends Date
      ? False
      : T extends Uint8Array
        ? False
        : T extends bigint
          ? False
          : T extends object
            ? True
            : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: PrismaPick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown
      ? (k: U) => void
      : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  export type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  export type Boolean = True | False;

  export type True = 1;

  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1, A2> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<"OR", K>, Extends<"AND", K>>,
      Extends<"NOT", K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = PrismaPick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName = {
    User: "User",
    UserSetting: "UserSetting",
    ServerSession: "ServerSession",
    ServerInfo: "ServerInfo",
    UserInfo: "UserInfo",
    Panel: "Panel",
    Timeline: "Timeline",
  } as const;

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  export interface TypeMapCb<ClientOptions = {}>
    extends runtime.Types.Utils.Fn<
      { extArgs: runtime.Types.Extensions.InternalArgs },
      runtime.Types.Utils.Record<string, any>
    > {
    returns: Prisma.TypeMap<
      this["params"]["extArgs"],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps:
        | "user"
        | "userSetting"
        | "serverSession"
        | "serverInfo"
        | "userInfo"
        | "panel"
        | "timeline";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<UserCountAggregateOutputType>
              | number;
          };
        };
      };
      UserSetting: {
        payload: Prisma.$UserSettingPayload<ExtArgs>;
        fields: Prisma.UserSettingFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserSettingFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserSettingFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>;
          };
          findFirst: {
            args: Prisma.UserSettingFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserSettingFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>;
          };
          findMany: {
            args: Prisma.UserSettingFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>[];
          };
          create: {
            args: Prisma.UserSettingCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>;
          };
          createMany: {
            args: Prisma.UserSettingCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserSettingCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>[];
          };
          delete: {
            args: Prisma.UserSettingDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>;
          };
          update: {
            args: Prisma.UserSettingUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>;
          };
          deleteMany: {
            args: Prisma.UserSettingDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserSettingUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserSettingUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>[];
          };
          upsert: {
            args: Prisma.UserSettingUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserSettingPayload>;
          };
          aggregate: {
            args: Prisma.UserSettingAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregateUserSetting>;
          };
          groupBy: {
            args: Prisma.UserSettingGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<UserSettingGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserSettingCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<UserSettingCountAggregateOutputType>
              | number;
          };
        };
      };
      ServerSession: {
        payload: Prisma.$ServerSessionPayload<ExtArgs>;
        fields: Prisma.ServerSessionFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ServerSessionFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ServerSessionFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>;
          };
          findFirst: {
            args: Prisma.ServerSessionFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ServerSessionFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>;
          };
          findMany: {
            args: Prisma.ServerSessionFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>[];
          };
          create: {
            args: Prisma.ServerSessionCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>;
          };
          createMany: {
            args: Prisma.ServerSessionCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ServerSessionCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>[];
          };
          delete: {
            args: Prisma.ServerSessionDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>;
          };
          update: {
            args: Prisma.ServerSessionUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>;
          };
          deleteMany: {
            args: Prisma.ServerSessionDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ServerSessionUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ServerSessionUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>[];
          };
          upsert: {
            args: Prisma.ServerSessionUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerSessionPayload>;
          };
          aggregate: {
            args: Prisma.ServerSessionAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregateServerSession>;
          };
          groupBy: {
            args: Prisma.ServerSessionGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<ServerSessionGroupByOutputType>[];
          };
          count: {
            args: Prisma.ServerSessionCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<ServerSessionCountAggregateOutputType>
              | number;
          };
        };
      };
      ServerInfo: {
        payload: Prisma.$ServerInfoPayload<ExtArgs>;
        fields: Prisma.ServerInfoFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ServerInfoFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ServerInfoFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>;
          };
          findFirst: {
            args: Prisma.ServerInfoFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ServerInfoFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>;
          };
          findMany: {
            args: Prisma.ServerInfoFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>[];
          };
          create: {
            args: Prisma.ServerInfoCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>;
          };
          createMany: {
            args: Prisma.ServerInfoCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ServerInfoCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>[];
          };
          delete: {
            args: Prisma.ServerInfoDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>;
          };
          update: {
            args: Prisma.ServerInfoUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>;
          };
          deleteMany: {
            args: Prisma.ServerInfoDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ServerInfoUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ServerInfoUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>[];
          };
          upsert: {
            args: Prisma.ServerInfoUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerInfoPayload>;
          };
          aggregate: {
            args: Prisma.ServerInfoAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregateServerInfo>;
          };
          groupBy: {
            args: Prisma.ServerInfoGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<ServerInfoGroupByOutputType>[];
          };
          count: {
            args: Prisma.ServerInfoCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<ServerInfoCountAggregateOutputType>
              | number;
          };
        };
      };
      UserInfo: {
        payload: Prisma.$UserInfoPayload<ExtArgs>;
        fields: Prisma.UserInfoFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserInfoFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserInfoFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>;
          };
          findFirst: {
            args: Prisma.UserInfoFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserInfoFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>;
          };
          findMany: {
            args: Prisma.UserInfoFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>[];
          };
          create: {
            args: Prisma.UserInfoCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>;
          };
          createMany: {
            args: Prisma.UserInfoCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserInfoCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>[];
          };
          delete: {
            args: Prisma.UserInfoDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>;
          };
          update: {
            args: Prisma.UserInfoUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>;
          };
          deleteMany: {
            args: Prisma.UserInfoDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserInfoUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserInfoUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>[];
          };
          upsert: {
            args: Prisma.UserInfoUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$UserInfoPayload>;
          };
          aggregate: {
            args: Prisma.UserInfoAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregateUserInfo>;
          };
          groupBy: {
            args: Prisma.UserInfoGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<UserInfoGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserInfoCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<UserInfoCountAggregateOutputType>
              | number;
          };
        };
      };
      Panel: {
        payload: Prisma.$PanelPayload<ExtArgs>;
        fields: Prisma.PanelFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PanelFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PanelFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>;
          };
          findFirst: {
            args: Prisma.PanelFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PanelFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>;
          };
          findMany: {
            args: Prisma.PanelFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>[];
          };
          create: {
            args: Prisma.PanelCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>;
          };
          createMany: {
            args: Prisma.PanelCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PanelCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>[];
          };
          delete: {
            args: Prisma.PanelDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>;
          };
          update: {
            args: Prisma.PanelUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>;
          };
          deleteMany: {
            args: Prisma.PanelDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PanelUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.PanelUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>[];
          };
          upsert: {
            args: Prisma.PanelUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$PanelPayload>;
          };
          aggregate: {
            args: Prisma.PanelAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregatePanel>;
          };
          groupBy: {
            args: Prisma.PanelGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<PanelGroupByOutputType>[];
          };
          count: {
            args: Prisma.PanelCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<PanelCountAggregateOutputType>
              | number;
          };
        };
      };
      Timeline: {
        payload: Prisma.$TimelinePayload<ExtArgs>;
        fields: Prisma.TimelineFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TimelineFindUniqueArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TimelineFindUniqueOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>;
          };
          findFirst: {
            args: Prisma.TimelineFindFirstArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TimelineFindFirstOrThrowArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>;
          };
          findMany: {
            args: Prisma.TimelineFindManyArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>[];
          };
          create: {
            args: Prisma.TimelineCreateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>;
          };
          createMany: {
            args: Prisma.TimelineCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TimelineCreateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>[];
          };
          delete: {
            args: Prisma.TimelineDeleteArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>;
          };
          update: {
            args: Prisma.TimelineUpdateArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>;
          };
          deleteMany: {
            args: Prisma.TimelineDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TimelineUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.TimelineUpdateManyAndReturnArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>[];
          };
          upsert: {
            args: Prisma.TimelineUpsertArgs<ExtArgs>;
            result: runtime.Types.Utils.PayloadToResult<Prisma.$TimelinePayload>;
          };
          aggregate: {
            args: Prisma.TimelineAggregateArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<AggregateTimeline>;
          };
          groupBy: {
            args: Prisma.TimelineGroupByArgs<ExtArgs>;
            result: runtime.Types.Utils.Optional<TimelineGroupByOutputType>[];
          };
          count: {
            args: Prisma.TimelineCountArgs<ExtArgs>;
            result:
              | runtime.Types.Utils.Optional<TimelineCountAggregateOutputType>
              | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension = runtime.Extensions
    .defineExtension as unknown as runtime.Types.Extensions.ExtendsHook<
    "define",
    Prisma.TypeMapCb,
    runtime.Types.Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = "pretty" | "colorless" | "minimal";
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    user?: UserOmit;
    userSetting?: UserSettingOmit;
    serverSession?: ServerSessionOmit;
    serverInfo?: ServerInfoOmit;
    userInfo?: UserInfoOmit;
    panel?: PanelOmit;
    timeline?: TimelineOmit;
  };

  /* Types for Logging */
  export type LogLevel = "info" | "query" | "warn" | "error";
  export type LogDefinition = {
    level: LogLevel;
    emit: "stdout" | "event";
  };

  export type GetLogType<T extends LogLevel | LogDefinition> =
    T extends LogDefinition
      ? T["emit"] extends "event"
        ? T["level"]
        : never
      : never;
  export type GetEvents<T> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | "findUnique"
    | "findUniqueOrThrow"
    | "findMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "create"
    | "createMany"
    | "createManyAndReturn"
    | "update"
    | "updateMany"
    | "updateManyAndReturn"
    | "upsert"
    | "delete"
    | "deleteMany"
    | "executeRaw"
    | "queryRaw"
    | "aggregate"
    | "count"
    | "runCommandRaw"
    | "findRaw"
    | "groupBy";

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => runtime.Types.Utils.JsPromise<T>,
  ) => runtime.Types.Utils.JsPromise<T>;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    serverSession: number;
    userSettings: number;
    userInfo: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | UserCountOutputTypeCountServerSessionArgs;
    userSettings?: boolean | UserCountOutputTypeCountUserSettingsArgs;
    userInfo?: boolean | UserCountOutputTypeCountUserInfoArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountServerSessionArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: ServerSessionWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserSettingsArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: UserSettingWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserInfoArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: UserInfoWhereInput;
  };

  /**
   * Count Type ServerSessionCountOutputType
   */

  export type ServerSessionCountOutputType = {
    panels: number;
    Timeline: number;
  };

  export type ServerSessionCountOutputTypeSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    panels?: boolean | ServerSessionCountOutputTypeCountPanelsArgs;
    Timeline?: boolean | ServerSessionCountOutputTypeCountTimelineArgs;
  };

  // Custom InputTypes
  /**
   * ServerSessionCountOutputType without action
   */
  export type ServerSessionCountOutputTypeDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSessionCountOutputType
     */
    select?: ServerSessionCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * ServerSessionCountOutputType without action
   */
  export type ServerSessionCountOutputTypeCountPanelsArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: PanelWhereInput;
  };

  /**
   * ServerSessionCountOutputType without action
   */
  export type ServerSessionCountOutputTypeCountTimelineArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: TimelineWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    name: string | null;
    password: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userRole: $Enums.UserRole | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    name: string | null;
    password: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userRole: $Enums.UserRole | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    name: number;
    password: number;
    createdAt: number;
    updatedAt: number;
    userRole: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    password?: true;
    createdAt?: true;
    updatedAt?: true;
    userRole?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    password?: true;
    createdAt?: true;
    updatedAt?: true;
    userRole?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    password?: true;
    createdAt?: true;
    updatedAt?: true;
    userRole?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: UserWhereInput;
    orderBy?:
      | UserOrderByWithAggregationInput
      | UserOrderByWithAggregationInput[];
    by: UserScalarFieldEnum[] | UserScalarFieldEnum;
    having?: UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
  };

  export type UserGroupByOutputType = {
    id: string;
    email: string;
    name: string | null;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    userRole: $Enums.UserRole;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      name?: boolean;
      password?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      userRole?: boolean;
      serverSession?: boolean | User$serverSessionArgs<ExtArgs>;
      userSettings?: boolean | User$userSettingsArgs<ExtArgs>;
      userInfo?: boolean | User$userInfoArgs<ExtArgs>;
      _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      name?: boolean;
      password?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      userRole?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      name?: boolean;
      password?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      userRole?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    name?: boolean;
    password?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userRole?: boolean;
  };

  export type UserOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    | "id"
    | "email"
    | "name"
    | "password"
    | "createdAt"
    | "updatedAt"
    | "userRole",
    ExtArgs["result"]["user"]
  >;
  export type UserInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | User$serverSessionArgs<ExtArgs>;
    userSettings?: boolean | User$userSettingsArgs<ExtArgs>;
    userInfo?: boolean | User$userInfoArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {};
  export type UserIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "User";
    objects: {
      serverSession: Prisma.$ServerSessionPayload<ExtArgs>[];
      userSettings: Prisma.$UserSettingPayload<ExtArgs>[];
      userInfo: Prisma.$UserInfoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        email: string;
        name: string | null;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        userRole: $Enums.UserRole;
      },
      ExtArgs["result"]["user"]
    >;
    composites: {};
  };

  export type UserGetPayload<
    S extends boolean | null | undefined | UserDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>;

  export type UserCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<UserFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["User"];
      meta: { name: "User" };
    };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs["orderBy"] }
        : { orderBy?: UserGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetUserGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    serverSession<T extends User$serverSessionArgs<ExtArgs> = {}>(
      args?: Subset<T, User$serverSessionArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | runtime.Types.Result.GetResult<
          Prisma.$ServerSessionPayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    userSettings<T extends User$userSettingsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$userSettingsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | runtime.Types.Result.GetResult<
          Prisma.$UserSettingPayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    userInfo<T extends User$userInfoArgs<ExtArgs> = {}>(
      args?: Subset<T, User$userInfoArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | runtime.Types.Result.GetResult<
          Prisma.$UserInfoPayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  export interface UserFieldRefs {
    readonly id: FieldRef<"User", "String">;
    readonly email: FieldRef<"User", "String">;
    readonly name: FieldRef<"User", "String">;
    readonly password: FieldRef<"User", "String">;
    readonly createdAt: FieldRef<"User", "DateTime">;
    readonly updatedAt: FieldRef<"User", "DateTime">;
    readonly userRole: FieldRef<"User", "UserRole">;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User create
   */
  export type UserCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: Xor<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: Xor<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: Xor<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to update Users.
     */
    data: Xor<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: Xor<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: Xor<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to delete.
     */
    limit?: number;
  };

  /**
   * User.serverSession
   */
  export type User$serverSessionArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    where?: ServerSessionWhereInput;
    orderBy?:
      | ServerSessionOrderByWithRelationInput
      | ServerSessionOrderByWithRelationInput[];
    cursor?: ServerSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: ServerSessionScalarFieldEnum | ServerSessionScalarFieldEnum[];
  };

  /**
   * User.userSettings
   */
  export type User$userSettingsArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    where?: UserSettingWhereInput;
    orderBy?:
      | UserSettingOrderByWithRelationInput
      | UserSettingOrderByWithRelationInput[];
    cursor?: UserSettingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: UserSettingScalarFieldEnum | UserSettingScalarFieldEnum[];
  };

  /**
   * User.userInfo
   */
  export type User$userInfoArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    where?: UserInfoWhereInput;
    orderBy?:
      | UserInfoOrderByWithRelationInput
      | UserInfoOrderByWithRelationInput[];
    cursor?: UserInfoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
  };

  /**
   * Model UserSetting
   */

  export type AggregateUserSetting = {
    _count: UserSettingCountAggregateOutputType | null;
    _min: UserSettingMinAggregateOutputType | null;
    _max: UserSettingMaxAggregateOutputType | null;
  };

  export type UserSettingMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    key: string | null;
    value: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserSettingMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    key: string | null;
    value: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserSettingCountAggregateOutputType = {
    id: number;
    userId: number;
    key: number;
    value: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type UserSettingMinAggregateInputType = {
    id?: true;
    userId?: true;
    key?: true;
    value?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserSettingMaxAggregateInputType = {
    id?: true;
    userId?: true;
    key?: true;
    value?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserSettingCountAggregateInputType = {
    id?: true;
    userId?: true;
    key?: true;
    value?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type UserSettingAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which UserSetting to aggregate.
     */
    where?: UserSettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?:
      | UserSettingOrderByWithRelationInput
      | UserSettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserSettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UserSettings
     **/
    _count?: true | UserSettingCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserSettingMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserSettingMaxAggregateInputType;
  };

  export type GetUserSettingAggregateType<T extends UserSettingAggregateArgs> =
    {
      [P in keyof T & keyof AggregateUserSetting]: P extends "_count" | "count"
        ? T[P] extends true
          ? number
          : GetScalarType<T[P], AggregateUserSetting[P]>
        : GetScalarType<T[P], AggregateUserSetting[P]>;
    };

  export type UserSettingGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: UserSettingWhereInput;
    orderBy?:
      | UserSettingOrderByWithAggregationInput
      | UserSettingOrderByWithAggregationInput[];
    by: UserSettingScalarFieldEnum[] | UserSettingScalarFieldEnum;
    having?: UserSettingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserSettingCountAggregateInputType | true;
    _min?: UserSettingMinAggregateInputType;
    _max?: UserSettingMaxAggregateInputType;
  };

  export type UserSettingGroupByOutputType = {
    id: string;
    userId: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
    _count: UserSettingCountAggregateOutputType | null;
    _min: UserSettingMinAggregateOutputType | null;
    _max: UserSettingMaxAggregateOutputType | null;
  };

  type GetUserSettingGroupByPayload<T extends UserSettingGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<UserSettingGroupByOutputType, T["by"]> & {
          [P in keyof T &
            keyof UserSettingGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSettingGroupByOutputType[P]>
            : GetScalarType<T[P], UserSettingGroupByOutputType[P]>;
        }
      >
    >;

  export type UserSettingSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      key?: boolean;
      value?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["userSetting"]
  >;

  export type UserSettingSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      key?: boolean;
      value?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["userSetting"]
  >;

  export type UserSettingSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      key?: boolean;
      value?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["userSetting"]
  >;

  export type UserSettingSelectScalar = {
    id?: boolean;
    userId?: boolean;
    key?: boolean;
    value?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type UserSettingOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    "id" | "userId" | "key" | "value" | "createdAt" | "updatedAt",
    ExtArgs["result"]["userSetting"]
  >;
  export type UserSettingInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type UserSettingIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type UserSettingIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $UserSettingPayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "UserSetting";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        key: string;
        value: string;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["userSetting"]
    >;
    composites: {};
  };

  export type UserSettingGetPayload<
    S extends boolean | null | undefined | UserSettingDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$UserSettingPayload, S>;

  export type UserSettingCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<
    UserSettingFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: UserSettingCountAggregateInputType | true;
  };

  export interface UserSettingDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["UserSetting"];
      meta: { name: "UserSetting" };
    };
    /**
     * Find zero or one UserSetting that matches the filter.
     * @param {UserSettingFindUniqueArgs} args - Arguments to find a UserSetting
     * @example
     * // Get one UserSetting
     * const userSetting = await prisma.userSetting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSettingFindUniqueArgs>(
      args: SelectSubset<T, UserSettingFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one UserSetting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserSettingFindUniqueOrThrowArgs} args - Arguments to find a UserSetting
     * @example
     * // Get one UserSetting
     * const userSetting = await prisma.userSetting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSettingFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserSettingFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first UserSetting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingFindFirstArgs} args - Arguments to find a UserSetting
     * @example
     * // Get one UserSetting
     * const userSetting = await prisma.userSetting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSettingFindFirstArgs>(
      args?: SelectSubset<T, UserSettingFindFirstArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first UserSetting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingFindFirstOrThrowArgs} args - Arguments to find a UserSetting
     * @example
     * // Get one UserSetting
     * const userSetting = await prisma.userSetting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSettingFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserSettingFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more UserSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSettings
     * const userSettings = await prisma.userSetting.findMany()
     *
     * // Get first 10 UserSettings
     * const userSettings = await prisma.userSetting.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userSettingWithIdOnly = await prisma.userSetting.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserSettingFindManyArgs>(
      args?: SelectSubset<T, UserSettingFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a UserSetting.
     * @param {UserSettingCreateArgs} args - Arguments to create a UserSetting.
     * @example
     * // Create one UserSetting
     * const UserSetting = await prisma.userSetting.create({
     *   data: {
     *     // ... data to create a UserSetting
     *   }
     * })
     *
     */
    create<T extends UserSettingCreateArgs>(
      args: SelectSubset<T, UserSettingCreateArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many UserSettings.
     * @param {UserSettingCreateManyArgs} args - Arguments to create many UserSettings.
     * @example
     * // Create many UserSettings
     * const userSetting = await prisma.userSetting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserSettingCreateManyArgs>(
      args?: SelectSubset<T, UserSettingCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many UserSettings and returns the data saved in the database.
     * @param {UserSettingCreateManyAndReturnArgs} args - Arguments to create many UserSettings.
     * @example
     * // Create many UserSettings
     * const userSetting = await prisma.userSetting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UserSettings and only return the `id`
     * const userSettingWithIdOnly = await prisma.userSetting.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserSettingCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserSettingCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a UserSetting.
     * @param {UserSettingDeleteArgs} args - Arguments to delete one UserSetting.
     * @example
     * // Delete one UserSetting
     * const UserSetting = await prisma.userSetting.delete({
     *   where: {
     *     // ... filter to delete one UserSetting
     *   }
     * })
     *
     */
    delete<T extends UserSettingDeleteArgs>(
      args: SelectSubset<T, UserSettingDeleteArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one UserSetting.
     * @param {UserSettingUpdateArgs} args - Arguments to update one UserSetting.
     * @example
     * // Update one UserSetting
     * const userSetting = await prisma.userSetting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserSettingUpdateArgs>(
      args: SelectSubset<T, UserSettingUpdateArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more UserSettings.
     * @param {UserSettingDeleteManyArgs} args - Arguments to filter UserSettings to delete.
     * @example
     * // Delete a few UserSettings
     * const { count } = await prisma.userSetting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserSettingDeleteManyArgs>(
      args?: SelectSubset<T, UserSettingDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSettings
     * const userSetting = await prisma.userSetting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserSettingUpdateManyArgs>(
      args: SelectSubset<T, UserSettingUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserSettings and returns the data updated in the database.
     * @param {UserSettingUpdateManyAndReturnArgs} args - Arguments to update many UserSettings.
     * @example
     * // Update many UserSettings
     * const userSetting = await prisma.userSetting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more UserSettings and only return the `id`
     * const userSettingWithIdOnly = await prisma.userSetting.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserSettingUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserSettingUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one UserSetting.
     * @param {UserSettingUpsertArgs} args - Arguments to update or create a UserSetting.
     * @example
     * // Update or create a UserSetting
     * const userSetting = await prisma.userSetting.upsert({
     *   create: {
     *     // ... data to create a UserSetting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSetting we want to update
     *   }
     * })
     */
    upsert<T extends UserSettingUpsertArgs>(
      args: SelectSubset<T, UserSettingUpsertArgs<ExtArgs>>,
    ): Prisma__UserSettingClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserSettingPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingCountArgs} args - Arguments to filter UserSettings to count.
     * @example
     * // Count the number of UserSettings
     * const count = await prisma.userSetting.count({
     *   where: {
     *     // ... the filter for the UserSettings we want to count
     *   }
     * })
     **/
    count<T extends UserSettingCountArgs>(
      args?: Subset<T, UserSettingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserSettingCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a UserSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserSettingAggregateArgs>(
      args: Subset<T, UserSettingAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserSettingAggregateType<T>>;

    /**
     * Group by UserSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserSettingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSettingGroupByArgs["orderBy"] }
        : { orderBy?: UserSettingGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserSettingGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetUserSettingGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UserSetting model
     */
    readonly fields: UserSettingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSetting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSettingClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | runtime.Types.Result.GetResult<
          Prisma.$UserPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the UserSetting model
   */
  export interface UserSettingFieldRefs {
    readonly id: FieldRef<"UserSetting", "String">;
    readonly userId: FieldRef<"UserSetting", "String">;
    readonly key: FieldRef<"UserSetting", "String">;
    readonly value: FieldRef<"UserSetting", "String">;
    readonly createdAt: FieldRef<"UserSetting", "DateTime">;
    readonly updatedAt: FieldRef<"UserSetting", "DateTime">;
  }

  // Custom InputTypes
  /**
   * UserSetting findUnique
   */
  export type UserSettingFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * Filter, which UserSetting to fetch.
     */
    where: UserSettingWhereUniqueInput;
  };

  /**
   * UserSetting findUniqueOrThrow
   */
  export type UserSettingFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * Filter, which UserSetting to fetch.
     */
    where: UserSettingWhereUniqueInput;
  };

  /**
   * UserSetting findFirst
   */
  export type UserSettingFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * Filter, which UserSetting to fetch.
     */
    where?: UserSettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?:
      | UserSettingOrderByWithRelationInput
      | UserSettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserSettings.
     */
    cursor?: UserSettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserSettings.
     */
    distinct?: UserSettingScalarFieldEnum | UserSettingScalarFieldEnum[];
  };

  /**
   * UserSetting findFirstOrThrow
   */
  export type UserSettingFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * Filter, which UserSetting to fetch.
     */
    where?: UserSettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?:
      | UserSettingOrderByWithRelationInput
      | UserSettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserSettings.
     */
    cursor?: UserSettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserSettings.
     */
    distinct?: UserSettingScalarFieldEnum | UserSettingScalarFieldEnum[];
  };

  /**
   * UserSetting findMany
   */
  export type UserSettingFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserSettings to fetch.
     */
    orderBy?:
      | UserSettingOrderByWithRelationInput
      | UserSettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UserSettings.
     */
    cursor?: UserSettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserSettings.
     */
    skip?: number;
    distinct?: UserSettingScalarFieldEnum | UserSettingScalarFieldEnum[];
  };

  /**
   * UserSetting create
   */
  export type UserSettingCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * The data needed to create a UserSetting.
     */
    data: Xor<UserSettingCreateInput, UserSettingUncheckedCreateInput>;
  };

  /**
   * UserSetting createMany
   */
  export type UserSettingCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many UserSettings.
     */
    data: UserSettingCreateManyInput | UserSettingCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * UserSetting createManyAndReturn
   */
  export type UserSettingCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * The data used to create many UserSettings.
     */
    data: UserSettingCreateManyInput | UserSettingCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * UserSetting update
   */
  export type UserSettingUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * The data needed to update a UserSetting.
     */
    data: Xor<UserSettingUpdateInput, UserSettingUncheckedUpdateInput>;
    /**
     * Choose, which UserSetting to update.
     */
    where: UserSettingWhereUniqueInput;
  };

  /**
   * UserSetting updateMany
   */
  export type UserSettingUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update UserSettings.
     */
    data: Xor<
      UserSettingUpdateManyMutationInput,
      UserSettingUncheckedUpdateManyInput
    >;
    /**
     * Filter which UserSettings to update
     */
    where?: UserSettingWhereInput;
    /**
     * Limit how many UserSettings to update.
     */
    limit?: number;
  };

  /**
   * UserSetting updateManyAndReturn
   */
  export type UserSettingUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * The data used to update UserSettings.
     */
    data: Xor<
      UserSettingUpdateManyMutationInput,
      UserSettingUncheckedUpdateManyInput
    >;
    /**
     * Filter which UserSettings to update
     */
    where?: UserSettingWhereInput;
    /**
     * Limit how many UserSettings to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * UserSetting upsert
   */
  export type UserSettingUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * The filter to search for the UserSetting to update in case it exists.
     */
    where: UserSettingWhereUniqueInput;
    /**
     * In case the UserSetting found by the `where` argument doesn't exist, create a new UserSetting with this data.
     */
    create: Xor<UserSettingCreateInput, UserSettingUncheckedCreateInput>;
    /**
     * In case the UserSetting was found with the provided `where` argument, update it with this data.
     */
    update: Xor<UserSettingUpdateInput, UserSettingUncheckedUpdateInput>;
  };

  /**
   * UserSetting delete
   */
  export type UserSettingDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
    /**
     * Filter which UserSetting to delete.
     */
    where: UserSettingWhereUniqueInput;
  };

  /**
   * UserSetting deleteMany
   */
  export type UserSettingDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which UserSettings to delete
     */
    where?: UserSettingWhereInput;
    /**
     * Limit how many UserSettings to delete.
     */
    limit?: number;
  };

  /**
   * UserSetting without action
   */
  export type UserSettingDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserSetting
     */
    select?: UserSettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserSetting
     */
    omit?: UserSettingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSettingInclude<ExtArgs> | null;
  };

  /**
   * Model ServerSession
   */

  export type AggregateServerSession = {
    _count: ServerSessionCountAggregateOutputType | null;
    _min: ServerSessionMinAggregateOutputType | null;
    _max: ServerSessionMaxAggregateOutputType | null;
  };

  export type ServerSessionMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    origin: string | null;
    serverToken: string | null;
    serverType: $Enums.ServerType | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ServerSessionMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    origin: string | null;
    serverToken: string | null;
    serverType: $Enums.ServerType | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ServerSessionCountAggregateOutputType = {
    id: number;
    userId: number;
    origin: number;
    serverToken: number;
    serverType: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type ServerSessionMinAggregateInputType = {
    id?: true;
    userId?: true;
    origin?: true;
    serverToken?: true;
    serverType?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ServerSessionMaxAggregateInputType = {
    id?: true;
    userId?: true;
    origin?: true;
    serverToken?: true;
    serverType?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ServerSessionCountAggregateInputType = {
    id?: true;
    userId?: true;
    origin?: true;
    serverToken?: true;
    serverType?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type ServerSessionAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ServerSession to aggregate.
     */
    where?: ServerSessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerSessions to fetch.
     */
    orderBy?:
      | ServerSessionOrderByWithRelationInput
      | ServerSessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ServerSessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerSessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerSessions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ServerSessions
     **/
    _count?: true | ServerSessionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ServerSessionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ServerSessionMaxAggregateInputType;
  };

  export type GetServerSessionAggregateType<
    T extends ServerSessionAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateServerSession]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServerSession[P]>
      : GetScalarType<T[P], AggregateServerSession[P]>;
  };

  export type ServerSessionGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: ServerSessionWhereInput;
    orderBy?:
      | ServerSessionOrderByWithAggregationInput
      | ServerSessionOrderByWithAggregationInput[];
    by: ServerSessionScalarFieldEnum[] | ServerSessionScalarFieldEnum;
    having?: ServerSessionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServerSessionCountAggregateInputType | true;
    _min?: ServerSessionMinAggregateInputType;
    _max?: ServerSessionMaxAggregateInputType;
  };

  export type ServerSessionGroupByOutputType = {
    id: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt: Date;
    updatedAt: Date;
    _count: ServerSessionCountAggregateOutputType | null;
    _min: ServerSessionMinAggregateOutputType | null;
    _max: ServerSessionMaxAggregateOutputType | null;
  };

  type GetServerSessionGroupByPayload<T extends ServerSessionGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ServerSessionGroupByOutputType, T["by"]> & {
          [P in keyof T &
            keyof ServerSessionGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServerSessionGroupByOutputType[P]>
            : GetScalarType<T[P], ServerSessionGroupByOutputType[P]>;
        }
      >
    >;

  export type ServerSessionSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      origin?: boolean;
      serverToken?: boolean;
      serverType?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
      panels?: boolean | ServerSession$panelsArgs<ExtArgs>;
      serverInfo?: boolean | ServerSession$serverInfoArgs<ExtArgs>;
      serverUserInfo?: boolean | ServerSession$serverUserInfoArgs<ExtArgs>;
      Timeline?: boolean | ServerSession$TimelineArgs<ExtArgs>;
      _count?: boolean | ServerSessionCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["serverSession"]
  >;

  export type ServerSessionSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      origin?: boolean;
      serverToken?: boolean;
      serverType?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["serverSession"]
  >;

  export type ServerSessionSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      origin?: boolean;
      serverToken?: boolean;
      serverType?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["serverSession"]
  >;

  export type ServerSessionSelectScalar = {
    id?: boolean;
    userId?: boolean;
    origin?: boolean;
    serverToken?: boolean;
    serverType?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type ServerSessionOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    | "id"
    | "userId"
    | "origin"
    | "serverToken"
    | "serverType"
    | "createdAt"
    | "updatedAt",
    ExtArgs["result"]["serverSession"]
  >;
  export type ServerSessionInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
    panels?: boolean | ServerSession$panelsArgs<ExtArgs>;
    serverInfo?: boolean | ServerSession$serverInfoArgs<ExtArgs>;
    serverUserInfo?: boolean | ServerSession$serverUserInfoArgs<ExtArgs>;
    Timeline?: boolean | ServerSession$TimelineArgs<ExtArgs>;
    _count?: boolean | ServerSessionCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type ServerSessionIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type ServerSessionIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $ServerSessionPayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "ServerSession";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
      panels: Prisma.$PanelPayload<ExtArgs>[];
      serverInfo: Prisma.$ServerInfoPayload<ExtArgs> | null;
      serverUserInfo: Prisma.$UserInfoPayload<ExtArgs> | null;
      Timeline: Prisma.$TimelinePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        origin: string;
        serverToken: string;
        serverType: $Enums.ServerType;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["serverSession"]
    >;
    composites: {};
  };

  export type ServerSessionGetPayload<
    S extends boolean | null | undefined | ServerSessionDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$ServerSessionPayload, S>;

  export type ServerSessionCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<
    ServerSessionFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: ServerSessionCountAggregateInputType | true;
  };

  export interface ServerSessionDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["ServerSession"];
      meta: { name: "ServerSession" };
    };
    /**
     * Find zero or one ServerSession that matches the filter.
     * @param {ServerSessionFindUniqueArgs} args - Arguments to find a ServerSession
     * @example
     * // Get one ServerSession
     * const serverSession = await prisma.serverSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServerSessionFindUniqueArgs>(
      args: SelectSubset<T, ServerSessionFindUniqueArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one ServerSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServerSessionFindUniqueOrThrowArgs} args - Arguments to find a ServerSession
     * @example
     * // Get one ServerSession
     * const serverSession = await prisma.serverSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServerSessionFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ServerSessionFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first ServerSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionFindFirstArgs} args - Arguments to find a ServerSession
     * @example
     * // Get one ServerSession
     * const serverSession = await prisma.serverSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServerSessionFindFirstArgs>(
      args?: SelectSubset<T, ServerSessionFindFirstArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first ServerSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionFindFirstOrThrowArgs} args - Arguments to find a ServerSession
     * @example
     * // Get one ServerSession
     * const serverSession = await prisma.serverSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServerSessionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ServerSessionFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more ServerSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServerSessions
     * const serverSessions = await prisma.serverSession.findMany()
     *
     * // Get first 10 ServerSessions
     * const serverSessions = await prisma.serverSession.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const serverSessionWithIdOnly = await prisma.serverSession.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ServerSessionFindManyArgs>(
      args?: SelectSubset<T, ServerSessionFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a ServerSession.
     * @param {ServerSessionCreateArgs} args - Arguments to create a ServerSession.
     * @example
     * // Create one ServerSession
     * const ServerSession = await prisma.serverSession.create({
     *   data: {
     *     // ... data to create a ServerSession
     *   }
     * })
     *
     */
    create<T extends ServerSessionCreateArgs>(
      args: SelectSubset<T, ServerSessionCreateArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many ServerSessions.
     * @param {ServerSessionCreateManyArgs} args - Arguments to create many ServerSessions.
     * @example
     * // Create many ServerSessions
     * const serverSession = await prisma.serverSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ServerSessionCreateManyArgs>(
      args?: SelectSubset<T, ServerSessionCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many ServerSessions and returns the data saved in the database.
     * @param {ServerSessionCreateManyAndReturnArgs} args - Arguments to create many ServerSessions.
     * @example
     * // Create many ServerSessions
     * const serverSession = await prisma.serverSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ServerSessions and only return the `id`
     * const serverSessionWithIdOnly = await prisma.serverSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ServerSessionCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ServerSessionCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a ServerSession.
     * @param {ServerSessionDeleteArgs} args - Arguments to delete one ServerSession.
     * @example
     * // Delete one ServerSession
     * const ServerSession = await prisma.serverSession.delete({
     *   where: {
     *     // ... filter to delete one ServerSession
     *   }
     * })
     *
     */
    delete<T extends ServerSessionDeleteArgs>(
      args: SelectSubset<T, ServerSessionDeleteArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one ServerSession.
     * @param {ServerSessionUpdateArgs} args - Arguments to update one ServerSession.
     * @example
     * // Update one ServerSession
     * const serverSession = await prisma.serverSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ServerSessionUpdateArgs>(
      args: SelectSubset<T, ServerSessionUpdateArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more ServerSessions.
     * @param {ServerSessionDeleteManyArgs} args - Arguments to filter ServerSessions to delete.
     * @example
     * // Delete a few ServerSessions
     * const { count } = await prisma.serverSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ServerSessionDeleteManyArgs>(
      args?: SelectSubset<T, ServerSessionDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ServerSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServerSessions
     * const serverSession = await prisma.serverSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ServerSessionUpdateManyArgs>(
      args: SelectSubset<T, ServerSessionUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ServerSessions and returns the data updated in the database.
     * @param {ServerSessionUpdateManyAndReturnArgs} args - Arguments to update many ServerSessions.
     * @example
     * // Update many ServerSessions
     * const serverSession = await prisma.serverSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ServerSessions and only return the `id`
     * const serverSessionWithIdOnly = await prisma.serverSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ServerSessionUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ServerSessionUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one ServerSession.
     * @param {ServerSessionUpsertArgs} args - Arguments to update or create a ServerSession.
     * @example
     * // Update or create a ServerSession
     * const serverSession = await prisma.serverSession.upsert({
     *   create: {
     *     // ... data to create a ServerSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServerSession we want to update
     *   }
     * })
     */
    upsert<T extends ServerSessionUpsertArgs>(
      args: SelectSubset<T, ServerSessionUpsertArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerSessionPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of ServerSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionCountArgs} args - Arguments to filter ServerSessions to count.
     * @example
     * // Count the number of ServerSessions
     * const count = await prisma.serverSession.count({
     *   where: {
     *     // ... the filter for the ServerSessions we want to count
     *   }
     * })
     **/
    count<T extends ServerSessionCountArgs>(
      args?: Subset<T, ServerSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ServerSessionCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a ServerSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ServerSessionAggregateArgs>(
      args: Subset<T, ServerSessionAggregateArgs>,
    ): Prisma.PrismaPromise<GetServerSessionAggregateType<T>>;

    /**
     * Group by ServerSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ServerSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServerSessionGroupByArgs["orderBy"] }
        : { orderBy?: ServerSessionGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ServerSessionGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetServerSessionGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ServerSession model
     */
    readonly fields: ServerSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServerSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServerSessionClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | runtime.Types.Result.GetResult<
          Prisma.$UserPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    panels<T extends ServerSession$panelsArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSession$panelsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | runtime.Types.Result.GetResult<
          Prisma.$PanelPayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    serverInfo<T extends ServerSession$serverInfoArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSession$serverInfoArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    serverUserInfo<T extends ServerSession$serverUserInfoArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSession$serverUserInfoArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    Timeline<T extends ServerSession$TimelineArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSession$TimelineArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | runtime.Types.Result.GetResult<
          Prisma.$TimelinePayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the ServerSession model
   */
  export interface ServerSessionFieldRefs {
    readonly id: FieldRef<"ServerSession", "String">;
    readonly userId: FieldRef<"ServerSession", "String">;
    readonly origin: FieldRef<"ServerSession", "String">;
    readonly serverToken: FieldRef<"ServerSession", "String">;
    readonly serverType: FieldRef<"ServerSession", "ServerType">;
    readonly createdAt: FieldRef<"ServerSession", "DateTime">;
    readonly updatedAt: FieldRef<"ServerSession", "DateTime">;
  }

  // Custom InputTypes
  /**
   * ServerSession findUnique
   */
  export type ServerSessionFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * Filter, which ServerSession to fetch.
     */
    where: ServerSessionWhereUniqueInput;
  };

  /**
   * ServerSession findUniqueOrThrow
   */
  export type ServerSessionFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * Filter, which ServerSession to fetch.
     */
    where: ServerSessionWhereUniqueInput;
  };

  /**
   * ServerSession findFirst
   */
  export type ServerSessionFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * Filter, which ServerSession to fetch.
     */
    where?: ServerSessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerSessions to fetch.
     */
    orderBy?:
      | ServerSessionOrderByWithRelationInput
      | ServerSessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ServerSessions.
     */
    cursor?: ServerSessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerSessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerSessions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ServerSessions.
     */
    distinct?: ServerSessionScalarFieldEnum | ServerSessionScalarFieldEnum[];
  };

  /**
   * ServerSession findFirstOrThrow
   */
  export type ServerSessionFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * Filter, which ServerSession to fetch.
     */
    where?: ServerSessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerSessions to fetch.
     */
    orderBy?:
      | ServerSessionOrderByWithRelationInput
      | ServerSessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ServerSessions.
     */
    cursor?: ServerSessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerSessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerSessions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ServerSessions.
     */
    distinct?: ServerSessionScalarFieldEnum | ServerSessionScalarFieldEnum[];
  };

  /**
   * ServerSession findMany
   */
  export type ServerSessionFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * Filter, which ServerSessions to fetch.
     */
    where?: ServerSessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerSessions to fetch.
     */
    orderBy?:
      | ServerSessionOrderByWithRelationInput
      | ServerSessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ServerSessions.
     */
    cursor?: ServerSessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerSessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerSessions.
     */
    skip?: number;
    distinct?: ServerSessionScalarFieldEnum | ServerSessionScalarFieldEnum[];
  };

  /**
   * ServerSession create
   */
  export type ServerSessionCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * The data needed to create a ServerSession.
     */
    data: Xor<ServerSessionCreateInput, ServerSessionUncheckedCreateInput>;
  };

  /**
   * ServerSession createMany
   */
  export type ServerSessionCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many ServerSessions.
     */
    data: ServerSessionCreateManyInput | ServerSessionCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ServerSession createManyAndReturn
   */
  export type ServerSessionCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * The data used to create many ServerSessions.
     */
    data: ServerSessionCreateManyInput | ServerSessionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * ServerSession update
   */
  export type ServerSessionUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * The data needed to update a ServerSession.
     */
    data: Xor<ServerSessionUpdateInput, ServerSessionUncheckedUpdateInput>;
    /**
     * Choose, which ServerSession to update.
     */
    where: ServerSessionWhereUniqueInput;
  };

  /**
   * ServerSession updateMany
   */
  export type ServerSessionUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update ServerSessions.
     */
    data: Xor<
      ServerSessionUpdateManyMutationInput,
      ServerSessionUncheckedUpdateManyInput
    >;
    /**
     * Filter which ServerSessions to update
     */
    where?: ServerSessionWhereInput;
    /**
     * Limit how many ServerSessions to update.
     */
    limit?: number;
  };

  /**
   * ServerSession updateManyAndReturn
   */
  export type ServerSessionUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * The data used to update ServerSessions.
     */
    data: Xor<
      ServerSessionUpdateManyMutationInput,
      ServerSessionUncheckedUpdateManyInput
    >;
    /**
     * Filter which ServerSessions to update
     */
    where?: ServerSessionWhereInput;
    /**
     * Limit how many ServerSessions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * ServerSession upsert
   */
  export type ServerSessionUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * The filter to search for the ServerSession to update in case it exists.
     */
    where: ServerSessionWhereUniqueInput;
    /**
     * In case the ServerSession found by the `where` argument doesn't exist, create a new ServerSession with this data.
     */
    create: Xor<ServerSessionCreateInput, ServerSessionUncheckedCreateInput>;
    /**
     * In case the ServerSession was found with the provided `where` argument, update it with this data.
     */
    update: Xor<ServerSessionUpdateInput, ServerSessionUncheckedUpdateInput>;
  };

  /**
   * ServerSession delete
   */
  export type ServerSessionDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
    /**
     * Filter which ServerSession to delete.
     */
    where: ServerSessionWhereUniqueInput;
  };

  /**
   * ServerSession deleteMany
   */
  export type ServerSessionDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ServerSessions to delete
     */
    where?: ServerSessionWhereInput;
    /**
     * Limit how many ServerSessions to delete.
     */
    limit?: number;
  };

  /**
   * ServerSession.panels
   */
  export type ServerSession$panelsArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    where?: PanelWhereInput;
    orderBy?: PanelOrderByWithRelationInput | PanelOrderByWithRelationInput[];
    cursor?: PanelWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: PanelScalarFieldEnum | PanelScalarFieldEnum[];
  };

  /**
   * ServerSession.serverInfo
   */
  export type ServerSession$serverInfoArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    where?: ServerInfoWhereInput;
  };

  /**
   * ServerSession.serverUserInfo
   */
  export type ServerSession$serverUserInfoArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    where?: UserInfoWhereInput;
  };

  /**
   * ServerSession.Timeline
   */
  export type ServerSession$TimelineArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    where?: TimelineWhereInput;
    orderBy?:
      | TimelineOrderByWithRelationInput
      | TimelineOrderByWithRelationInput[];
    cursor?: TimelineWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TimelineScalarFieldEnum | TimelineScalarFieldEnum[];
  };

  /**
   * ServerSession without action
   */
  export type ServerSessionDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerSession
     */
    select?: ServerSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerSession
     */
    omit?: ServerSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerSessionInclude<ExtArgs> | null;
  };

  /**
   * Model ServerInfo
   */

  export type AggregateServerInfo = {
    _count: ServerInfoCountAggregateOutputType | null;
    _min: ServerInfoMinAggregateOutputType | null;
    _max: ServerInfoMaxAggregateOutputType | null;
  };

  export type ServerInfoMinAggregateOutputType = {
    id: string | null;
    serverSessionId: string | null;
    name: string | null;
    iconUrl: string | null;
    faviconUrl: string | null;
    themeColor: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ServerInfoMaxAggregateOutputType = {
    id: string | null;
    serverSessionId: string | null;
    name: string | null;
    iconUrl: string | null;
    faviconUrl: string | null;
    themeColor: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ServerInfoCountAggregateOutputType = {
    id: number;
    serverSessionId: number;
    name: number;
    iconUrl: number;
    faviconUrl: number;
    themeColor: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type ServerInfoMinAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    name?: true;
    iconUrl?: true;
    faviconUrl?: true;
    themeColor?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ServerInfoMaxAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    name?: true;
    iconUrl?: true;
    faviconUrl?: true;
    themeColor?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ServerInfoCountAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    name?: true;
    iconUrl?: true;
    faviconUrl?: true;
    themeColor?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type ServerInfoAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ServerInfo to aggregate.
     */
    where?: ServerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerInfos to fetch.
     */
    orderBy?:
      | ServerInfoOrderByWithRelationInput
      | ServerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ServerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ServerInfos
     **/
    _count?: true | ServerInfoCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ServerInfoMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ServerInfoMaxAggregateInputType;
  };

  export type GetServerInfoAggregateType<T extends ServerInfoAggregateArgs> = {
    [P in keyof T & keyof AggregateServerInfo]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServerInfo[P]>
      : GetScalarType<T[P], AggregateServerInfo[P]>;
  };

  export type ServerInfoGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: ServerInfoWhereInput;
    orderBy?:
      | ServerInfoOrderByWithAggregationInput
      | ServerInfoOrderByWithAggregationInput[];
    by: ServerInfoScalarFieldEnum[] | ServerInfoScalarFieldEnum;
    having?: ServerInfoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServerInfoCountAggregateInputType | true;
    _min?: ServerInfoMinAggregateInputType;
    _max?: ServerInfoMaxAggregateInputType;
  };

  export type ServerInfoGroupByOutputType = {
    id: string;
    serverSessionId: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ServerInfoCountAggregateOutputType | null;
    _min: ServerInfoMinAggregateOutputType | null;
    _max: ServerInfoMaxAggregateOutputType | null;
  };

  type GetServerInfoGroupByPayload<T extends ServerInfoGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ServerInfoGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof ServerInfoGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServerInfoGroupByOutputType[P]>
            : GetScalarType<T[P], ServerInfoGroupByOutputType[P]>;
        }
      >
    >;

  export type ServerInfoSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      name?: boolean;
      iconUrl?: boolean;
      faviconUrl?: boolean;
      themeColor?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["serverInfo"]
  >;

  export type ServerInfoSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      name?: boolean;
      iconUrl?: boolean;
      faviconUrl?: boolean;
      themeColor?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["serverInfo"]
  >;

  export type ServerInfoSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      name?: boolean;
      iconUrl?: boolean;
      faviconUrl?: boolean;
      themeColor?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["serverInfo"]
  >;

  export type ServerInfoSelectScalar = {
    id?: boolean;
    serverSessionId?: boolean;
    name?: boolean;
    iconUrl?: boolean;
    faviconUrl?: boolean;
    themeColor?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type ServerInfoOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    | "id"
    | "serverSessionId"
    | "name"
    | "iconUrl"
    | "faviconUrl"
    | "themeColor"
    | "createdAt"
    | "updatedAt",
    ExtArgs["result"]["serverInfo"]
  >;
  export type ServerInfoInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };
  export type ServerInfoIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };
  export type ServerInfoIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };

  export type $ServerInfoPayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "ServerInfo";
    objects: {
      serverSession: Prisma.$ServerSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        serverSessionId: string;
        name: string;
        iconUrl: string;
        faviconUrl: string;
        themeColor: string;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["serverInfo"]
    >;
    composites: {};
  };

  export type ServerInfoGetPayload<
    S extends boolean | null | undefined | ServerInfoDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$ServerInfoPayload, S>;

  export type ServerInfoCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<
    ServerInfoFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: ServerInfoCountAggregateInputType | true;
  };

  export interface ServerInfoDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["ServerInfo"];
      meta: { name: "ServerInfo" };
    };
    /**
     * Find zero or one ServerInfo that matches the filter.
     * @param {ServerInfoFindUniqueArgs} args - Arguments to find a ServerInfo
     * @example
     * // Get one ServerInfo
     * const serverInfo = await prisma.serverInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServerInfoFindUniqueArgs>(
      args: SelectSubset<T, ServerInfoFindUniqueArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one ServerInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServerInfoFindUniqueOrThrowArgs} args - Arguments to find a ServerInfo
     * @example
     * // Get one ServerInfo
     * const serverInfo = await prisma.serverInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServerInfoFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ServerInfoFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first ServerInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoFindFirstArgs} args - Arguments to find a ServerInfo
     * @example
     * // Get one ServerInfo
     * const serverInfo = await prisma.serverInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServerInfoFindFirstArgs>(
      args?: SelectSubset<T, ServerInfoFindFirstArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first ServerInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoFindFirstOrThrowArgs} args - Arguments to find a ServerInfo
     * @example
     * // Get one ServerInfo
     * const serverInfo = await prisma.serverInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServerInfoFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ServerInfoFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more ServerInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServerInfos
     * const serverInfos = await prisma.serverInfo.findMany()
     *
     * // Get first 10 ServerInfos
     * const serverInfos = await prisma.serverInfo.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const serverInfoWithIdOnly = await prisma.serverInfo.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ServerInfoFindManyArgs>(
      args?: SelectSubset<T, ServerInfoFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a ServerInfo.
     * @param {ServerInfoCreateArgs} args - Arguments to create a ServerInfo.
     * @example
     * // Create one ServerInfo
     * const ServerInfo = await prisma.serverInfo.create({
     *   data: {
     *     // ... data to create a ServerInfo
     *   }
     * })
     *
     */
    create<T extends ServerInfoCreateArgs>(
      args: SelectSubset<T, ServerInfoCreateArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many ServerInfos.
     * @param {ServerInfoCreateManyArgs} args - Arguments to create many ServerInfos.
     * @example
     * // Create many ServerInfos
     * const serverInfo = await prisma.serverInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ServerInfoCreateManyArgs>(
      args?: SelectSubset<T, ServerInfoCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many ServerInfos and returns the data saved in the database.
     * @param {ServerInfoCreateManyAndReturnArgs} args - Arguments to create many ServerInfos.
     * @example
     * // Create many ServerInfos
     * const serverInfo = await prisma.serverInfo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ServerInfos and only return the `id`
     * const serverInfoWithIdOnly = await prisma.serverInfo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ServerInfoCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ServerInfoCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a ServerInfo.
     * @param {ServerInfoDeleteArgs} args - Arguments to delete one ServerInfo.
     * @example
     * // Delete one ServerInfo
     * const ServerInfo = await prisma.serverInfo.delete({
     *   where: {
     *     // ... filter to delete one ServerInfo
     *   }
     * })
     *
     */
    delete<T extends ServerInfoDeleteArgs>(
      args: SelectSubset<T, ServerInfoDeleteArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one ServerInfo.
     * @param {ServerInfoUpdateArgs} args - Arguments to update one ServerInfo.
     * @example
     * // Update one ServerInfo
     * const serverInfo = await prisma.serverInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ServerInfoUpdateArgs>(
      args: SelectSubset<T, ServerInfoUpdateArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more ServerInfos.
     * @param {ServerInfoDeleteManyArgs} args - Arguments to filter ServerInfos to delete.
     * @example
     * // Delete a few ServerInfos
     * const { count } = await prisma.serverInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ServerInfoDeleteManyArgs>(
      args?: SelectSubset<T, ServerInfoDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ServerInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServerInfos
     * const serverInfo = await prisma.serverInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ServerInfoUpdateManyArgs>(
      args: SelectSubset<T, ServerInfoUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ServerInfos and returns the data updated in the database.
     * @param {ServerInfoUpdateManyAndReturnArgs} args - Arguments to update many ServerInfos.
     * @example
     * // Update many ServerInfos
     * const serverInfo = await prisma.serverInfo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ServerInfos and only return the `id`
     * const serverInfoWithIdOnly = await prisma.serverInfo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ServerInfoUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ServerInfoUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one ServerInfo.
     * @param {ServerInfoUpsertArgs} args - Arguments to update or create a ServerInfo.
     * @example
     * // Update or create a ServerInfo
     * const serverInfo = await prisma.serverInfo.upsert({
     *   create: {
     *     // ... data to create a ServerInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServerInfo we want to update
     *   }
     * })
     */
    upsert<T extends ServerInfoUpsertArgs>(
      args: SelectSubset<T, ServerInfoUpsertArgs<ExtArgs>>,
    ): Prisma__ServerInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$ServerInfoPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of ServerInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoCountArgs} args - Arguments to filter ServerInfos to count.
     * @example
     * // Count the number of ServerInfos
     * const count = await prisma.serverInfo.count({
     *   where: {
     *     // ... the filter for the ServerInfos we want to count
     *   }
     * })
     **/
    count<T extends ServerInfoCountArgs>(
      args?: Subset<T, ServerInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ServerInfoCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a ServerInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ServerInfoAggregateArgs>(
      args: Subset<T, ServerInfoAggregateArgs>,
    ): Prisma.PrismaPromise<GetServerInfoAggregateType<T>>;

    /**
     * Group by ServerInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServerInfoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ServerInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServerInfoGroupByArgs["orderBy"] }
        : { orderBy?: ServerInfoGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ServerInfoGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetServerInfoGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ServerInfo model
     */
    readonly fields: ServerInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServerInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServerInfoClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    serverSession<T extends ServerSessionDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSessionDefaultArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      | runtime.Types.Result.GetResult<
          Prisma.$ServerSessionPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the ServerInfo model
   */
  export interface ServerInfoFieldRefs {
    readonly id: FieldRef<"ServerInfo", "String">;
    readonly serverSessionId: FieldRef<"ServerInfo", "String">;
    readonly name: FieldRef<"ServerInfo", "String">;
    readonly iconUrl: FieldRef<"ServerInfo", "String">;
    readonly faviconUrl: FieldRef<"ServerInfo", "String">;
    readonly themeColor: FieldRef<"ServerInfo", "String">;
    readonly createdAt: FieldRef<"ServerInfo", "DateTime">;
    readonly updatedAt: FieldRef<"ServerInfo", "DateTime">;
  }

  // Custom InputTypes
  /**
   * ServerInfo findUnique
   */
  export type ServerInfoFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which ServerInfo to fetch.
     */
    where: ServerInfoWhereUniqueInput;
  };

  /**
   * ServerInfo findUniqueOrThrow
   */
  export type ServerInfoFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which ServerInfo to fetch.
     */
    where: ServerInfoWhereUniqueInput;
  };

  /**
   * ServerInfo findFirst
   */
  export type ServerInfoFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which ServerInfo to fetch.
     */
    where?: ServerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerInfos to fetch.
     */
    orderBy?:
      | ServerInfoOrderByWithRelationInput
      | ServerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ServerInfos.
     */
    cursor?: ServerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ServerInfos.
     */
    distinct?: ServerInfoScalarFieldEnum | ServerInfoScalarFieldEnum[];
  };

  /**
   * ServerInfo findFirstOrThrow
   */
  export type ServerInfoFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which ServerInfo to fetch.
     */
    where?: ServerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerInfos to fetch.
     */
    orderBy?:
      | ServerInfoOrderByWithRelationInput
      | ServerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ServerInfos.
     */
    cursor?: ServerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ServerInfos.
     */
    distinct?: ServerInfoScalarFieldEnum | ServerInfoScalarFieldEnum[];
  };

  /**
   * ServerInfo findMany
   */
  export type ServerInfoFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which ServerInfos to fetch.
     */
    where?: ServerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ServerInfos to fetch.
     */
    orderBy?:
      | ServerInfoOrderByWithRelationInput
      | ServerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ServerInfos.
     */
    cursor?: ServerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ServerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ServerInfos.
     */
    skip?: number;
    distinct?: ServerInfoScalarFieldEnum | ServerInfoScalarFieldEnum[];
  };

  /**
   * ServerInfo create
   */
  export type ServerInfoCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * The data needed to create a ServerInfo.
     */
    data: Xor<ServerInfoCreateInput, ServerInfoUncheckedCreateInput>;
  };

  /**
   * ServerInfo createMany
   */
  export type ServerInfoCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many ServerInfos.
     */
    data: ServerInfoCreateManyInput | ServerInfoCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ServerInfo createManyAndReturn
   */
  export type ServerInfoCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * The data used to create many ServerInfos.
     */
    data: ServerInfoCreateManyInput | ServerInfoCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * ServerInfo update
   */
  export type ServerInfoUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * The data needed to update a ServerInfo.
     */
    data: Xor<ServerInfoUpdateInput, ServerInfoUncheckedUpdateInput>;
    /**
     * Choose, which ServerInfo to update.
     */
    where: ServerInfoWhereUniqueInput;
  };

  /**
   * ServerInfo updateMany
   */
  export type ServerInfoUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update ServerInfos.
     */
    data: Xor<
      ServerInfoUpdateManyMutationInput,
      ServerInfoUncheckedUpdateManyInput
    >;
    /**
     * Filter which ServerInfos to update
     */
    where?: ServerInfoWhereInput;
    /**
     * Limit how many ServerInfos to update.
     */
    limit?: number;
  };

  /**
   * ServerInfo updateManyAndReturn
   */
  export type ServerInfoUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * The data used to update ServerInfos.
     */
    data: Xor<
      ServerInfoUpdateManyMutationInput,
      ServerInfoUncheckedUpdateManyInput
    >;
    /**
     * Filter which ServerInfos to update
     */
    where?: ServerInfoWhereInput;
    /**
     * Limit how many ServerInfos to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * ServerInfo upsert
   */
  export type ServerInfoUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * The filter to search for the ServerInfo to update in case it exists.
     */
    where: ServerInfoWhereUniqueInput;
    /**
     * In case the ServerInfo found by the `where` argument doesn't exist, create a new ServerInfo with this data.
     */
    create: Xor<ServerInfoCreateInput, ServerInfoUncheckedCreateInput>;
    /**
     * In case the ServerInfo was found with the provided `where` argument, update it with this data.
     */
    update: Xor<ServerInfoUpdateInput, ServerInfoUncheckedUpdateInput>;
  };

  /**
   * ServerInfo delete
   */
  export type ServerInfoDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
    /**
     * Filter which ServerInfo to delete.
     */
    where: ServerInfoWhereUniqueInput;
  };

  /**
   * ServerInfo deleteMany
   */
  export type ServerInfoDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ServerInfos to delete
     */
    where?: ServerInfoWhereInput;
    /**
     * Limit how many ServerInfos to delete.
     */
    limit?: number;
  };

  /**
   * ServerInfo without action
   */
  export type ServerInfoDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ServerInfo
     */
    select?: ServerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerInfo
     */
    omit?: ServerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServerInfoInclude<ExtArgs> | null;
  };

  /**
   * Model UserInfo
   */

  export type AggregateUserInfo = {
    _count: UserInfoCountAggregateOutputType | null;
    _min: UserInfoMinAggregateOutputType | null;
    _max: UserInfoMaxAggregateOutputType | null;
  };

  export type UserInfoMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    serverSEssionId: string | null;
    userId: string | null;
  };

  export type UserInfoMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    serverSEssionId: string | null;
    userId: string | null;
  };

  export type UserInfoCountAggregateOutputType = {
    id: number;
    name: number;
    username: number;
    avatarUrl: number;
    createdAt: number;
    updatedAt: number;
    serverSEssionId: number;
    userId: number;
    _all: number;
  };

  export type UserInfoMinAggregateInputType = {
    id?: true;
    name?: true;
    username?: true;
    avatarUrl?: true;
    createdAt?: true;
    updatedAt?: true;
    serverSEssionId?: true;
    userId?: true;
  };

  export type UserInfoMaxAggregateInputType = {
    id?: true;
    name?: true;
    username?: true;
    avatarUrl?: true;
    createdAt?: true;
    updatedAt?: true;
    serverSEssionId?: true;
    userId?: true;
  };

  export type UserInfoCountAggregateInputType = {
    id?: true;
    name?: true;
    username?: true;
    avatarUrl?: true;
    createdAt?: true;
    updatedAt?: true;
    serverSEssionId?: true;
    userId?: true;
    _all?: true;
  };

  export type UserInfoAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which UserInfo to aggregate.
     */
    where?: UserInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserInfos to fetch.
     */
    orderBy?:
      | UserInfoOrderByWithRelationInput
      | UserInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UserInfos
     **/
    _count?: true | UserInfoCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserInfoMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserInfoMaxAggregateInputType;
  };

  export type GetUserInfoAggregateType<T extends UserInfoAggregateArgs> = {
    [P in keyof T & keyof AggregateUserInfo]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserInfo[P]>
      : GetScalarType<T[P], AggregateUserInfo[P]>;
  };

  export type UserInfoGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: UserInfoWhereInput;
    orderBy?:
      | UserInfoOrderByWithAggregationInput
      | UserInfoOrderByWithAggregationInput[];
    by: UserInfoScalarFieldEnum[] | UserInfoScalarFieldEnum;
    having?: UserInfoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserInfoCountAggregateInputType | true;
    _min?: UserInfoMinAggregateInputType;
    _max?: UserInfoMaxAggregateInputType;
  };

  export type UserInfoGroupByOutputType = {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
    serverSEssionId: string;
    userId: string | null;
    _count: UserInfoCountAggregateOutputType | null;
    _min: UserInfoMinAggregateOutputType | null;
    _max: UserInfoMaxAggregateOutputType | null;
  };

  type GetUserInfoGroupByPayload<T extends UserInfoGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<UserInfoGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof UserInfoGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserInfoGroupByOutputType[P]>
            : GetScalarType<T[P], UserInfoGroupByOutputType[P]>;
        }
      >
    >;

  export type UserInfoSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      username?: boolean;
      avatarUrl?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSEssionId?: boolean;
      userId?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
      User?: boolean | UserInfo$UserArgs<ExtArgs>;
    },
    ExtArgs["result"]["userInfo"]
  >;

  export type UserInfoSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      username?: boolean;
      avatarUrl?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSEssionId?: boolean;
      userId?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
      User?: boolean | UserInfo$UserArgs<ExtArgs>;
    },
    ExtArgs["result"]["userInfo"]
  >;

  export type UserInfoSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      username?: boolean;
      avatarUrl?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSEssionId?: boolean;
      userId?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
      User?: boolean | UserInfo$UserArgs<ExtArgs>;
    },
    ExtArgs["result"]["userInfo"]
  >;

  export type UserInfoSelectScalar = {
    id?: boolean;
    name?: boolean;
    username?: boolean;
    avatarUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    serverSEssionId?: boolean;
    userId?: boolean;
  };

  export type UserInfoOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    | "id"
    | "name"
    | "username"
    | "avatarUrl"
    | "createdAt"
    | "updatedAt"
    | "serverSEssionId"
    | "userId",
    ExtArgs["result"]["userInfo"]
  >;
  export type UserInfoInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    User?: boolean | UserInfo$UserArgs<ExtArgs>;
  };
  export type UserInfoIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    User?: boolean | UserInfo$UserArgs<ExtArgs>;
  };
  export type UserInfoIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    User?: boolean | UserInfo$UserArgs<ExtArgs>;
  };

  export type $UserInfoPayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "UserInfo";
    objects: {
      serverSession: Prisma.$ServerSessionPayload<ExtArgs>;
      User: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        username: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
        serverSEssionId: string;
        userId: string | null;
      },
      ExtArgs["result"]["userInfo"]
    >;
    composites: {};
  };

  export type UserInfoGetPayload<
    S extends boolean | null | undefined | UserInfoDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$UserInfoPayload, S>;

  export type UserInfoCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<UserInfoFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
    select?: UserInfoCountAggregateInputType | true;
  };

  export interface UserInfoDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["UserInfo"];
      meta: { name: "UserInfo" };
    };
    /**
     * Find zero or one UserInfo that matches the filter.
     * @param {UserInfoFindUniqueArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserInfoFindUniqueArgs>(
      args: SelectSubset<T, UserInfoFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one UserInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserInfoFindUniqueOrThrowArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserInfoFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserInfoFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first UserInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoFindFirstArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserInfoFindFirstArgs>(
      args?: SelectSubset<T, UserInfoFindFirstArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first UserInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoFindFirstOrThrowArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserInfoFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserInfoFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more UserInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserInfos
     * const userInfos = await prisma.userInfo.findMany()
     *
     * // Get first 10 UserInfos
     * const userInfos = await prisma.userInfo.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userInfoWithIdOnly = await prisma.userInfo.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserInfoFindManyArgs>(
      args?: SelectSubset<T, UserInfoFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a UserInfo.
     * @param {UserInfoCreateArgs} args - Arguments to create a UserInfo.
     * @example
     * // Create one UserInfo
     * const UserInfo = await prisma.userInfo.create({
     *   data: {
     *     // ... data to create a UserInfo
     *   }
     * })
     *
     */
    create<T extends UserInfoCreateArgs>(
      args: SelectSubset<T, UserInfoCreateArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many UserInfos.
     * @param {UserInfoCreateManyArgs} args - Arguments to create many UserInfos.
     * @example
     * // Create many UserInfos
     * const userInfo = await prisma.userInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserInfoCreateManyArgs>(
      args?: SelectSubset<T, UserInfoCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many UserInfos and returns the data saved in the database.
     * @param {UserInfoCreateManyAndReturnArgs} args - Arguments to create many UserInfos.
     * @example
     * // Create many UserInfos
     * const userInfo = await prisma.userInfo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UserInfos and only return the `id`
     * const userInfoWithIdOnly = await prisma.userInfo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserInfoCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserInfoCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a UserInfo.
     * @param {UserInfoDeleteArgs} args - Arguments to delete one UserInfo.
     * @example
     * // Delete one UserInfo
     * const UserInfo = await prisma.userInfo.delete({
     *   where: {
     *     // ... filter to delete one UserInfo
     *   }
     * })
     *
     */
    delete<T extends UserInfoDeleteArgs>(
      args: SelectSubset<T, UserInfoDeleteArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one UserInfo.
     * @param {UserInfoUpdateArgs} args - Arguments to update one UserInfo.
     * @example
     * // Update one UserInfo
     * const userInfo = await prisma.userInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserInfoUpdateArgs>(
      args: SelectSubset<T, UserInfoUpdateArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more UserInfos.
     * @param {UserInfoDeleteManyArgs} args - Arguments to filter UserInfos to delete.
     * @example
     * // Delete a few UserInfos
     * const { count } = await prisma.userInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserInfoDeleteManyArgs>(
      args?: SelectSubset<T, UserInfoDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserInfos
     * const userInfo = await prisma.userInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserInfoUpdateManyArgs>(
      args: SelectSubset<T, UserInfoUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserInfos and returns the data updated in the database.
     * @param {UserInfoUpdateManyAndReturnArgs} args - Arguments to update many UserInfos.
     * @example
     * // Update many UserInfos
     * const userInfo = await prisma.userInfo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more UserInfos and only return the `id`
     * const userInfoWithIdOnly = await prisma.userInfo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserInfoUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserInfoUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one UserInfo.
     * @param {UserInfoUpsertArgs} args - Arguments to update or create a UserInfo.
     * @example
     * // Update or create a UserInfo
     * const userInfo = await prisma.userInfo.upsert({
     *   create: {
     *     // ... data to create a UserInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserInfo we want to update
     *   }
     * })
     */
    upsert<T extends UserInfoUpsertArgs>(
      args: SelectSubset<T, UserInfoUpsertArgs<ExtArgs>>,
    ): Prisma__UserInfoClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserInfoPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of UserInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoCountArgs} args - Arguments to filter UserInfos to count.
     * @example
     * // Count the number of UserInfos
     * const count = await prisma.userInfo.count({
     *   where: {
     *     // ... the filter for the UserInfos we want to count
     *   }
     * })
     **/
    count<T extends UserInfoCountArgs>(
      args?: Subset<T, UserInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserInfoCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a UserInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserInfoAggregateArgs>(
      args: Subset<T, UserInfoAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserInfoAggregateType<T>>;

    /**
     * Group by UserInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserInfoGroupByArgs["orderBy"] }
        : { orderBy?: UserInfoGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserInfoGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetUserInfoGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UserInfo model
     */
    readonly fields: UserInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserInfoClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    serverSession<T extends ServerSessionDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSessionDefaultArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      | runtime.Types.Result.GetResult<
          Prisma.$ServerSessionPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    User<T extends UserInfo$UserArgs<ExtArgs> = {}>(
      args?: Subset<T, UserInfo$UserArgs<ExtArgs>>,
    ): Prisma__UserClient<
      runtime.Types.Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the UserInfo model
   */
  export interface UserInfoFieldRefs {
    readonly id: FieldRef<"UserInfo", "String">;
    readonly name: FieldRef<"UserInfo", "String">;
    readonly username: FieldRef<"UserInfo", "String">;
    readonly avatarUrl: FieldRef<"UserInfo", "String">;
    readonly createdAt: FieldRef<"UserInfo", "DateTime">;
    readonly updatedAt: FieldRef<"UserInfo", "DateTime">;
    readonly serverSEssionId: FieldRef<"UserInfo", "String">;
    readonly userId: FieldRef<"UserInfo", "String">;
  }

  // Custom InputTypes
  /**
   * UserInfo findUnique
   */
  export type UserInfoFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * Filter, which UserInfo to fetch.
     */
    where: UserInfoWhereUniqueInput;
  };

  /**
   * UserInfo findUniqueOrThrow
   */
  export type UserInfoFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * Filter, which UserInfo to fetch.
     */
    where: UserInfoWhereUniqueInput;
  };

  /**
   * UserInfo findFirst
   */
  export type UserInfoFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * Filter, which UserInfo to fetch.
     */
    where?: UserInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserInfos to fetch.
     */
    orderBy?:
      | UserInfoOrderByWithRelationInput
      | UserInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserInfos.
     */
    cursor?: UserInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserInfos.
     */
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[];
  };

  /**
   * UserInfo findFirstOrThrow
   */
  export type UserInfoFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * Filter, which UserInfo to fetch.
     */
    where?: UserInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserInfos to fetch.
     */
    orderBy?:
      | UserInfoOrderByWithRelationInput
      | UserInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserInfos.
     */
    cursor?: UserInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserInfos.
     */
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[];
  };

  /**
   * UserInfo findMany
   */
  export type UserInfoFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * Filter, which UserInfos to fetch.
     */
    where?: UserInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserInfos to fetch.
     */
    orderBy?:
      | UserInfoOrderByWithRelationInput
      | UserInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UserInfos.
     */
    cursor?: UserInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserInfos.
     */
    skip?: number;
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[];
  };

  /**
   * UserInfo create
   */
  export type UserInfoCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * The data needed to create a UserInfo.
     */
    data: Xor<UserInfoCreateInput, UserInfoUncheckedCreateInput>;
  };

  /**
   * UserInfo createMany
   */
  export type UserInfoCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many UserInfos.
     */
    data: UserInfoCreateManyInput | UserInfoCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * UserInfo createManyAndReturn
   */
  export type UserInfoCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * The data used to create many UserInfos.
     */
    data: UserInfoCreateManyInput | UserInfoCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * UserInfo update
   */
  export type UserInfoUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * The data needed to update a UserInfo.
     */
    data: Xor<UserInfoUpdateInput, UserInfoUncheckedUpdateInput>;
    /**
     * Choose, which UserInfo to update.
     */
    where: UserInfoWhereUniqueInput;
  };

  /**
   * UserInfo updateMany
   */
  export type UserInfoUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update UserInfos.
     */
    data: Xor<
      UserInfoUpdateManyMutationInput,
      UserInfoUncheckedUpdateManyInput
    >;
    /**
     * Filter which UserInfos to update
     */
    where?: UserInfoWhereInput;
    /**
     * Limit how many UserInfos to update.
     */
    limit?: number;
  };

  /**
   * UserInfo updateManyAndReturn
   */
  export type UserInfoUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * The data used to update UserInfos.
     */
    data: Xor<
      UserInfoUpdateManyMutationInput,
      UserInfoUncheckedUpdateManyInput
    >;
    /**
     * Filter which UserInfos to update
     */
    where?: UserInfoWhereInput;
    /**
     * Limit how many UserInfos to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * UserInfo upsert
   */
  export type UserInfoUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * The filter to search for the UserInfo to update in case it exists.
     */
    where: UserInfoWhereUniqueInput;
    /**
     * In case the UserInfo found by the `where` argument doesn't exist, create a new UserInfo with this data.
     */
    create: Xor<UserInfoCreateInput, UserInfoUncheckedCreateInput>;
    /**
     * In case the UserInfo was found with the provided `where` argument, update it with this data.
     */
    update: Xor<UserInfoUpdateInput, UserInfoUncheckedUpdateInput>;
  };

  /**
   * UserInfo delete
   */
  export type UserInfoDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
    /**
     * Filter which UserInfo to delete.
     */
    where: UserInfoWhereUniqueInput;
  };

  /**
   * UserInfo deleteMany
   */
  export type UserInfoDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which UserInfos to delete
     */
    where?: UserInfoWhereInput;
    /**
     * Limit how many UserInfos to delete.
     */
    limit?: number;
  };

  /**
   * UserInfo.User
   */
  export type UserInfo$UserArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    where?: UserWhereInput;
  };

  /**
   * UserInfo without action
   */
  export type UserInfoDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null;
  };

  /**
   * Model Panel
   */

  export type AggregatePanel = {
    _count: PanelCountAggregateOutputType | null;
    _min: PanelMinAggregateOutputType | null;
    _max: PanelMaxAggregateOutputType | null;
  };

  export type PanelMinAggregateOutputType = {
    id: string | null;
    serverSessionId: string | null;
    type: string | null;
  };

  export type PanelMaxAggregateOutputType = {
    id: string | null;
    serverSessionId: string | null;
    type: string | null;
  };

  export type PanelCountAggregateOutputType = {
    id: number;
    serverSessionId: number;
    type: number;
    _all: number;
  };

  export type PanelMinAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    type?: true;
  };

  export type PanelMaxAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    type?: true;
  };

  export type PanelCountAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    type?: true;
    _all?: true;
  };

  export type PanelAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Panel to aggregate.
     */
    where?: PanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Panels to fetch.
     */
    orderBy?: PanelOrderByWithRelationInput | PanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Panels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Panels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Panels
     **/
    _count?: true | PanelCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PanelMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PanelMaxAggregateInputType;
  };

  export type GetPanelAggregateType<T extends PanelAggregateArgs> = {
    [P in keyof T & keyof AggregatePanel]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePanel[P]>
      : GetScalarType<T[P], AggregatePanel[P]>;
  };

  export type PanelGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: PanelWhereInput;
    orderBy?:
      | PanelOrderByWithAggregationInput
      | PanelOrderByWithAggregationInput[];
    by: PanelScalarFieldEnum[] | PanelScalarFieldEnum;
    having?: PanelScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PanelCountAggregateInputType | true;
    _min?: PanelMinAggregateInputType;
    _max?: PanelMaxAggregateInputType;
  };

  export type PanelGroupByOutputType = {
    id: string;
    serverSessionId: string;
    type: string;
    _count: PanelCountAggregateOutputType | null;
    _min: PanelMinAggregateOutputType | null;
    _max: PanelMaxAggregateOutputType | null;
  };

  type GetPanelGroupByPayload<T extends PanelGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<PanelGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof PanelGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PanelGroupByOutputType[P]>
            : GetScalarType<T[P], PanelGroupByOutputType[P]>;
        }
      >
    >;

  export type PanelSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      type?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["panel"]
  >;

  export type PanelSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      type?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["panel"]
  >;

  export type PanelSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      type?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["panel"]
  >;

  export type PanelSelectScalar = {
    id?: boolean;
    serverSessionId?: boolean;
    type?: boolean;
  };

  export type PanelOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    "id" | "serverSessionId" | "type",
    ExtArgs["result"]["panel"]
  >;
  export type PanelInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };
  export type PanelIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };
  export type PanelIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };

  export type $PanelPayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "Panel";
    objects: {
      serverSession: Prisma.$ServerSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        serverSessionId: string;
        type: string;
      },
      ExtArgs["result"]["panel"]
    >;
    composites: {};
  };

  export type PanelGetPayload<
    S extends boolean | null | undefined | PanelDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$PanelPayload, S>;

  export type PanelCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<PanelFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
    select?: PanelCountAggregateInputType | true;
  };

  export interface PanelDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Panel"];
      meta: { name: "Panel" };
    };
    /**
     * Find zero or one Panel that matches the filter.
     * @param {PanelFindUniqueArgs} args - Arguments to find a Panel
     * @example
     * // Get one Panel
     * const panel = await prisma.panel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PanelFindUniqueArgs>(
      args: SelectSubset<T, PanelFindUniqueArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Panel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PanelFindUniqueOrThrowArgs} args - Arguments to find a Panel
     * @example
     * // Get one Panel
     * const panel = await prisma.panel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PanelFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PanelFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Panel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelFindFirstArgs} args - Arguments to find a Panel
     * @example
     * // Get one Panel
     * const panel = await prisma.panel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PanelFindFirstArgs>(
      args?: SelectSubset<T, PanelFindFirstArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Panel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelFindFirstOrThrowArgs} args - Arguments to find a Panel
     * @example
     * // Get one Panel
     * const panel = await prisma.panel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PanelFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PanelFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Panels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Panels
     * const panels = await prisma.panel.findMany()
     *
     * // Get first 10 Panels
     * const panels = await prisma.panel.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const panelWithIdOnly = await prisma.panel.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PanelFindManyArgs>(
      args?: SelectSubset<T, PanelFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Panel.
     * @param {PanelCreateArgs} args - Arguments to create a Panel.
     * @example
     * // Create one Panel
     * const Panel = await prisma.panel.create({
     *   data: {
     *     // ... data to create a Panel
     *   }
     * })
     *
     */
    create<T extends PanelCreateArgs>(
      args: SelectSubset<T, PanelCreateArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Panels.
     * @param {PanelCreateManyArgs} args - Arguments to create many Panels.
     * @example
     * // Create many Panels
     * const panel = await prisma.panel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PanelCreateManyArgs>(
      args?: SelectSubset<T, PanelCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Panels and returns the data saved in the database.
     * @param {PanelCreateManyAndReturnArgs} args - Arguments to create many Panels.
     * @example
     * // Create many Panels
     * const panel = await prisma.panel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Panels and only return the `id`
     * const panelWithIdOnly = await prisma.panel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PanelCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PanelCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Panel.
     * @param {PanelDeleteArgs} args - Arguments to delete one Panel.
     * @example
     * // Delete one Panel
     * const Panel = await prisma.panel.delete({
     *   where: {
     *     // ... filter to delete one Panel
     *   }
     * })
     *
     */
    delete<T extends PanelDeleteArgs>(
      args: SelectSubset<T, PanelDeleteArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Panel.
     * @param {PanelUpdateArgs} args - Arguments to update one Panel.
     * @example
     * // Update one Panel
     * const panel = await prisma.panel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PanelUpdateArgs>(
      args: SelectSubset<T, PanelUpdateArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Panels.
     * @param {PanelDeleteManyArgs} args - Arguments to filter Panels to delete.
     * @example
     * // Delete a few Panels
     * const { count } = await prisma.panel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PanelDeleteManyArgs>(
      args?: SelectSubset<T, PanelDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Panels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Panels
     * const panel = await prisma.panel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PanelUpdateManyArgs>(
      args: SelectSubset<T, PanelUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Panels and returns the data updated in the database.
     * @param {PanelUpdateManyAndReturnArgs} args - Arguments to update many Panels.
     * @example
     * // Update many Panels
     * const panel = await prisma.panel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Panels and only return the `id`
     * const panelWithIdOnly = await prisma.panel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PanelUpdateManyAndReturnArgs>(
      args: SelectSubset<T, PanelUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Panel.
     * @param {PanelUpsertArgs} args - Arguments to update or create a Panel.
     * @example
     * // Update or create a Panel
     * const panel = await prisma.panel.upsert({
     *   create: {
     *     // ... data to create a Panel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Panel we want to update
     *   }
     * })
     */
    upsert<T extends PanelUpsertArgs>(
      args: SelectSubset<T, PanelUpsertArgs<ExtArgs>>,
    ): Prisma__PanelClient<
      runtime.Types.Result.GetResult<
        Prisma.$PanelPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Panels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelCountArgs} args - Arguments to filter Panels to count.
     * @example
     * // Count the number of Panels
     * const count = await prisma.panel.count({
     *   where: {
     *     // ... the filter for the Panels we want to count
     *   }
     * })
     **/
    count<T extends PanelCountArgs>(
      args?: Subset<T, PanelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], PanelCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Panel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PanelAggregateArgs>(
      args: Subset<T, PanelAggregateArgs>,
    ): Prisma.PrismaPromise<GetPanelAggregateType<T>>;

    /**
     * Group by Panel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PanelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PanelGroupByArgs["orderBy"] }
        : { orderBy?: PanelGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PanelGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetPanelGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Panel model
     */
    readonly fields: PanelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Panel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PanelClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    serverSession<T extends ServerSessionDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSessionDefaultArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      | runtime.Types.Result.GetResult<
          Prisma.$ServerSessionPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the Panel model
   */
  export interface PanelFieldRefs {
    readonly id: FieldRef<"Panel", "String">;
    readonly serverSessionId: FieldRef<"Panel", "String">;
    readonly type: FieldRef<"Panel", "String">;
  }

  // Custom InputTypes
  /**
   * Panel findUnique
   */
  export type PanelFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * Filter, which Panel to fetch.
     */
    where: PanelWhereUniqueInput;
  };

  /**
   * Panel findUniqueOrThrow
   */
  export type PanelFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * Filter, which Panel to fetch.
     */
    where: PanelWhereUniqueInput;
  };

  /**
   * Panel findFirst
   */
  export type PanelFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * Filter, which Panel to fetch.
     */
    where?: PanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Panels to fetch.
     */
    orderBy?: PanelOrderByWithRelationInput | PanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Panels.
     */
    cursor?: PanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Panels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Panels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Panels.
     */
    distinct?: PanelScalarFieldEnum | PanelScalarFieldEnum[];
  };

  /**
   * Panel findFirstOrThrow
   */
  export type PanelFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * Filter, which Panel to fetch.
     */
    where?: PanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Panels to fetch.
     */
    orderBy?: PanelOrderByWithRelationInput | PanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Panels.
     */
    cursor?: PanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Panels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Panels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Panels.
     */
    distinct?: PanelScalarFieldEnum | PanelScalarFieldEnum[];
  };

  /**
   * Panel findMany
   */
  export type PanelFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * Filter, which Panels to fetch.
     */
    where?: PanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Panels to fetch.
     */
    orderBy?: PanelOrderByWithRelationInput | PanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Panels.
     */
    cursor?: PanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Panels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Panels.
     */
    skip?: number;
    distinct?: PanelScalarFieldEnum | PanelScalarFieldEnum[];
  };

  /**
   * Panel create
   */
  export type PanelCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * The data needed to create a Panel.
     */
    data: Xor<PanelCreateInput, PanelUncheckedCreateInput>;
  };

  /**
   * Panel createMany
   */
  export type PanelCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Panels.
     */
    data: PanelCreateManyInput | PanelCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Panel createManyAndReturn
   */
  export type PanelCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * The data used to create many Panels.
     */
    data: PanelCreateManyInput | PanelCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Panel update
   */
  export type PanelUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * The data needed to update a Panel.
     */
    data: Xor<PanelUpdateInput, PanelUncheckedUpdateInput>;
    /**
     * Choose, which Panel to update.
     */
    where: PanelWhereUniqueInput;
  };

  /**
   * Panel updateMany
   */
  export type PanelUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Panels.
     */
    data: Xor<PanelUpdateManyMutationInput, PanelUncheckedUpdateManyInput>;
    /**
     * Filter which Panels to update
     */
    where?: PanelWhereInput;
    /**
     * Limit how many Panels to update.
     */
    limit?: number;
  };

  /**
   * Panel updateManyAndReturn
   */
  export type PanelUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * The data used to update Panels.
     */
    data: Xor<PanelUpdateManyMutationInput, PanelUncheckedUpdateManyInput>;
    /**
     * Filter which Panels to update
     */
    where?: PanelWhereInput;
    /**
     * Limit how many Panels to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Panel upsert
   */
  export type PanelUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * The filter to search for the Panel to update in case it exists.
     */
    where: PanelWhereUniqueInput;
    /**
     * In case the Panel found by the `where` argument doesn't exist, create a new Panel with this data.
     */
    create: Xor<PanelCreateInput, PanelUncheckedCreateInput>;
    /**
     * In case the Panel was found with the provided `where` argument, update it with this data.
     */
    update: Xor<PanelUpdateInput, PanelUncheckedUpdateInput>;
  };

  /**
   * Panel delete
   */
  export type PanelDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
    /**
     * Filter which Panel to delete.
     */
    where: PanelWhereUniqueInput;
  };

  /**
   * Panel deleteMany
   */
  export type PanelDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Panels to delete
     */
    where?: PanelWhereInput;
    /**
     * Limit how many Panels to delete.
     */
    limit?: number;
  };

  /**
   * Panel without action
   */
  export type PanelDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Panel
     */
    select?: PanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Panel
     */
    omit?: PanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanelInclude<ExtArgs> | null;
  };

  /**
   * Model Timeline
   */

  export type AggregateTimeline = {
    _count: TimelineCountAggregateOutputType | null;
    _min: TimelineMinAggregateOutputType | null;
    _max: TimelineMaxAggregateOutputType | null;
  };

  export type TimelineMinAggregateOutputType = {
    id: string | null;
    serverSessionId: string | null;
    name: string | null;
    type: $Enums.TimelineType | null;
    listId: string | null;
    channelId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TimelineMaxAggregateOutputType = {
    id: string | null;
    serverSessionId: string | null;
    name: string | null;
    type: $Enums.TimelineType | null;
    listId: string | null;
    channelId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TimelineCountAggregateOutputType = {
    id: number;
    serverSessionId: number;
    name: number;
    type: number;
    listId: number;
    channelId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type TimelineMinAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    name?: true;
    type?: true;
    listId?: true;
    channelId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TimelineMaxAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    name?: true;
    type?: true;
    listId?: true;
    channelId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TimelineCountAggregateInputType = {
    id?: true;
    serverSessionId?: true;
    name?: true;
    type?: true;
    listId?: true;
    channelId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type TimelineAggregateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Timeline to aggregate.
     */
    where?: TimelineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Timelines to fetch.
     */
    orderBy?:
      | TimelineOrderByWithRelationInput
      | TimelineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TimelineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Timelines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Timelines.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Timelines
     **/
    _count?: true | TimelineCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TimelineMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TimelineMaxAggregateInputType;
  };

  export type GetTimelineAggregateType<T extends TimelineAggregateArgs> = {
    [P in keyof T & keyof AggregateTimeline]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTimeline[P]>
      : GetScalarType<T[P], AggregateTimeline[P]>;
  };

  export type TimelineGroupByArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    where?: TimelineWhereInput;
    orderBy?:
      | TimelineOrderByWithAggregationInput
      | TimelineOrderByWithAggregationInput[];
    by: TimelineScalarFieldEnum[] | TimelineScalarFieldEnum;
    having?: TimelineScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TimelineCountAggregateInputType | true;
    _min?: TimelineMinAggregateInputType;
    _max?: TimelineMaxAggregateInputType;
  };

  export type TimelineGroupByOutputType = {
    id: string;
    serverSessionId: string;
    name: string;
    type: $Enums.TimelineType;
    listId: string | null;
    channelId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TimelineCountAggregateOutputType | null;
    _min: TimelineMinAggregateOutputType | null;
    _max: TimelineMaxAggregateOutputType | null;
  };

  type GetTimelineGroupByPayload<T extends TimelineGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<TimelineGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof TimelineGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TimelineGroupByOutputType[P]>
            : GetScalarType<T[P], TimelineGroupByOutputType[P]>;
        }
      >
    >;

  export type TimelineSelect<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      name?: boolean;
      type?: boolean;
      listId?: boolean;
      channelId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["timeline"]
  >;

  export type TimelineSelectCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      name?: boolean;
      type?: boolean;
      listId?: boolean;
      channelId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["timeline"]
  >;

  export type TimelineSelectUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetSelect<
    {
      id?: boolean;
      serverSessionId?: boolean;
      name?: boolean;
      type?: boolean;
      listId?: boolean;
      channelId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["timeline"]
  >;

  export type TimelineSelectScalar = {
    id?: boolean;
    serverSessionId?: boolean;
    name?: boolean;
    type?: boolean;
    listId?: boolean;
    channelId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type TimelineOmit<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = runtime.Types.Extensions.GetOmit<
    | "id"
    | "serverSessionId"
    | "name"
    | "type"
    | "listId"
    | "channelId"
    | "createdAt"
    | "updatedAt",
    ExtArgs["result"]["timeline"]
  >;
  export type TimelineInclude<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };
  export type TimelineIncludeCreateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };
  export type TimelineIncludeUpdateManyAndReturn<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    serverSession?: boolean | ServerSessionDefaultArgs<ExtArgs>;
  };

  export type $TimelinePayload<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    name: "Timeline";
    objects: {
      serverSession: Prisma.$ServerSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<
      {
        id: string;
        serverSessionId: string;
        name: string;
        type: $Enums.TimelineType;
        listId: string | null;
        channelId: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["timeline"]
    >;
    composites: {};
  };

  export type TimelineGetPayload<
    S extends boolean | null | undefined | TimelineDefaultArgs,
  > = runtime.Types.Result.GetResult<Prisma.$TimelinePayload, S>;

  export type TimelineCountArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = Omit<TimelineFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
    select?: TimelineCountAggregateInputType | true;
  };

  export interface TimelineDelegate<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [k: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Timeline"];
      meta: { name: "Timeline" };
    };
    /**
     * Find zero or one Timeline that matches the filter.
     * @param {TimelineFindUniqueArgs} args - Arguments to find a Timeline
     * @example
     * // Get one Timeline
     * const timeline = await prisma.timeline.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TimelineFindUniqueArgs>(
      args: SelectSubset<T, TimelineFindUniqueArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Timeline that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TimelineFindUniqueOrThrowArgs} args - Arguments to find a Timeline
     * @example
     * // Get one Timeline
     * const timeline = await prisma.timeline.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TimelineFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TimelineFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Timeline that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineFindFirstArgs} args - Arguments to find a Timeline
     * @example
     * // Get one Timeline
     * const timeline = await prisma.timeline.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TimelineFindFirstArgs>(
      args?: SelectSubset<T, TimelineFindFirstArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Timeline that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineFindFirstOrThrowArgs} args - Arguments to find a Timeline
     * @example
     * // Get one Timeline
     * const timeline = await prisma.timeline.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TimelineFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TimelineFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Timelines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Timelines
     * const timelines = await prisma.timeline.findMany()
     *
     * // Get first 10 Timelines
     * const timelines = await prisma.timeline.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const timelineWithIdOnly = await prisma.timeline.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TimelineFindManyArgs>(
      args?: SelectSubset<T, TimelineFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Timeline.
     * @param {TimelineCreateArgs} args - Arguments to create a Timeline.
     * @example
     * // Create one Timeline
     * const Timeline = await prisma.timeline.create({
     *   data: {
     *     // ... data to create a Timeline
     *   }
     * })
     *
     */
    create<T extends TimelineCreateArgs>(
      args: SelectSubset<T, TimelineCreateArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Timelines.
     * @param {TimelineCreateManyArgs} args - Arguments to create many Timelines.
     * @example
     * // Create many Timelines
     * const timeline = await prisma.timeline.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TimelineCreateManyArgs>(
      args?: SelectSubset<T, TimelineCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Timelines and returns the data saved in the database.
     * @param {TimelineCreateManyAndReturnArgs} args - Arguments to create many Timelines.
     * @example
     * // Create many Timelines
     * const timeline = await prisma.timeline.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Timelines and only return the `id`
     * const timelineWithIdOnly = await prisma.timeline.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TimelineCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TimelineCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Timeline.
     * @param {TimelineDeleteArgs} args - Arguments to delete one Timeline.
     * @example
     * // Delete one Timeline
     * const Timeline = await prisma.timeline.delete({
     *   where: {
     *     // ... filter to delete one Timeline
     *   }
     * })
     *
     */
    delete<T extends TimelineDeleteArgs>(
      args: SelectSubset<T, TimelineDeleteArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Timeline.
     * @param {TimelineUpdateArgs} args - Arguments to update one Timeline.
     * @example
     * // Update one Timeline
     * const timeline = await prisma.timeline.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TimelineUpdateArgs>(
      args: SelectSubset<T, TimelineUpdateArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Timelines.
     * @param {TimelineDeleteManyArgs} args - Arguments to filter Timelines to delete.
     * @example
     * // Delete a few Timelines
     * const { count } = await prisma.timeline.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TimelineDeleteManyArgs>(
      args?: SelectSubset<T, TimelineDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Timelines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Timelines
     * const timeline = await prisma.timeline.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TimelineUpdateManyArgs>(
      args: SelectSubset<T, TimelineUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Timelines and returns the data updated in the database.
     * @param {TimelineUpdateManyAndReturnArgs} args - Arguments to update many Timelines.
     * @example
     * // Update many Timelines
     * const timeline = await prisma.timeline.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Timelines and only return the `id`
     * const timelineWithIdOnly = await prisma.timeline.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends TimelineUpdateManyAndReturnArgs>(
      args: SelectSubset<T, TimelineUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Timeline.
     * @param {TimelineUpsertArgs} args - Arguments to update or create a Timeline.
     * @example
     * // Update or create a Timeline
     * const timeline = await prisma.timeline.upsert({
     *   create: {
     *     // ... data to create a Timeline
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Timeline we want to update
     *   }
     * })
     */
    upsert<T extends TimelineUpsertArgs>(
      args: SelectSubset<T, TimelineUpsertArgs<ExtArgs>>,
    ): Prisma__TimelineClient<
      runtime.Types.Result.GetResult<
        Prisma.$TimelinePayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Timelines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineCountArgs} args - Arguments to filter Timelines to count.
     * @example
     * // Count the number of Timelines
     * const count = await prisma.timeline.count({
     *   where: {
     *     // ... the filter for the Timelines we want to count
     *   }
     * })
     **/
    count<T extends TimelineCountArgs>(
      args?: Subset<T, TimelineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends runtime.Types.Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], TimelineCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Timeline.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TimelineAggregateArgs>(
      args: Subset<T, TimelineAggregateArgs>,
    ): Prisma.PrismaPromise<GetTimelineAggregateType<T>>;

    /**
     * Group by Timeline.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimelineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TimelineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TimelineGroupByArgs["orderBy"] }
        : { orderBy?: TimelineGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, TimelineGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetTimelineGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Timeline model
     */
    readonly fields: TimelineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Timeline.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TimelineClient<
    T,
    Null = never,
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    serverSession<T extends ServerSessionDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ServerSessionDefaultArgs<ExtArgs>>,
    ): Prisma__ServerSessionClient<
      | runtime.Types.Result.GetResult<
          Prisma.$ServerSessionPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(
      onfinally?: (() => void) | undefined | null,
    ): runtime.Types.Utils.JsPromise<T>;
  }

  /**
   * Fields of the Timeline model
   */
  export interface TimelineFieldRefs {
    readonly id: FieldRef<"Timeline", "String">;
    readonly serverSessionId: FieldRef<"Timeline", "String">;
    readonly name: FieldRef<"Timeline", "String">;
    readonly type: FieldRef<"Timeline", "TimelineType">;
    readonly listId: FieldRef<"Timeline", "String">;
    readonly channelId: FieldRef<"Timeline", "String">;
    readonly createdAt: FieldRef<"Timeline", "DateTime">;
    readonly updatedAt: FieldRef<"Timeline", "DateTime">;
  }

  // Custom InputTypes
  /**
   * Timeline findUnique
   */
  export type TimelineFindUniqueArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * Filter, which Timeline to fetch.
     */
    where: TimelineWhereUniqueInput;
  };

  /**
   * Timeline findUniqueOrThrow
   */
  export type TimelineFindUniqueOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * Filter, which Timeline to fetch.
     */
    where: TimelineWhereUniqueInput;
  };

  /**
   * Timeline findFirst
   */
  export type TimelineFindFirstArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * Filter, which Timeline to fetch.
     */
    where?: TimelineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Timelines to fetch.
     */
    orderBy?:
      | TimelineOrderByWithRelationInput
      | TimelineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Timelines.
     */
    cursor?: TimelineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Timelines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Timelines.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Timelines.
     */
    distinct?: TimelineScalarFieldEnum | TimelineScalarFieldEnum[];
  };

  /**
   * Timeline findFirstOrThrow
   */
  export type TimelineFindFirstOrThrowArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * Filter, which Timeline to fetch.
     */
    where?: TimelineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Timelines to fetch.
     */
    orderBy?:
      | TimelineOrderByWithRelationInput
      | TimelineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Timelines.
     */
    cursor?: TimelineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Timelines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Timelines.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Timelines.
     */
    distinct?: TimelineScalarFieldEnum | TimelineScalarFieldEnum[];
  };

  /**
   * Timeline findMany
   */
  export type TimelineFindManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * Filter, which Timelines to fetch.
     */
    where?: TimelineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Timelines to fetch.
     */
    orderBy?:
      | TimelineOrderByWithRelationInput
      | TimelineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Timelines.
     */
    cursor?: TimelineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Timelines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Timelines.
     */
    skip?: number;
    distinct?: TimelineScalarFieldEnum | TimelineScalarFieldEnum[];
  };

  /**
   * Timeline create
   */
  export type TimelineCreateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * The data needed to create a Timeline.
     */
    data: Xor<TimelineCreateInput, TimelineUncheckedCreateInput>;
  };

  /**
   * Timeline createMany
   */
  export type TimelineCreateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Timelines.
     */
    data: TimelineCreateManyInput | TimelineCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Timeline createManyAndReturn
   */
  export type TimelineCreateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * The data used to create many Timelines.
     */
    data: TimelineCreateManyInput | TimelineCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Timeline update
   */
  export type TimelineUpdateArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * The data needed to update a Timeline.
     */
    data: Xor<TimelineUpdateInput, TimelineUncheckedUpdateInput>;
    /**
     * Choose, which Timeline to update.
     */
    where: TimelineWhereUniqueInput;
  };

  /**
   * Timeline updateMany
   */
  export type TimelineUpdateManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Timelines.
     */
    data: Xor<
      TimelineUpdateManyMutationInput,
      TimelineUncheckedUpdateManyInput
    >;
    /**
     * Filter which Timelines to update
     */
    where?: TimelineWhereInput;
    /**
     * Limit how many Timelines to update.
     */
    limit?: number;
  };

  /**
   * Timeline updateManyAndReturn
   */
  export type TimelineUpdateManyAndReturnArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * The data used to update Timelines.
     */
    data: Xor<
      TimelineUpdateManyMutationInput,
      TimelineUncheckedUpdateManyInput
    >;
    /**
     * Filter which Timelines to update
     */
    where?: TimelineWhereInput;
    /**
     * Limit how many Timelines to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Timeline upsert
   */
  export type TimelineUpsertArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * The filter to search for the Timeline to update in case it exists.
     */
    where: TimelineWhereUniqueInput;
    /**
     * In case the Timeline found by the `where` argument doesn't exist, create a new Timeline with this data.
     */
    create: Xor<TimelineCreateInput, TimelineUncheckedCreateInput>;
    /**
     * In case the Timeline was found with the provided `where` argument, update it with this data.
     */
    update: Xor<TimelineUpdateInput, TimelineUncheckedUpdateInput>;
  };

  /**
   * Timeline delete
   */
  export type TimelineDeleteArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
    /**
     * Filter which Timeline to delete.
     */
    where: TimelineWhereUniqueInput;
  };

  /**
   * Timeline deleteMany
   */
  export type TimelineDeleteManyArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Timelines to delete
     */
    where?: TimelineWhereInput;
    /**
     * Limit how many Timelines to delete.
     */
    limit?: number;
  };

  /**
   * Timeline without action
   */
  export type TimelineDefaultArgs<
    ExtArgs extends
      runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Timeline
     */
    select?: TimelineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Timeline
     */
    omit?: TimelineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimelineInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: "ReadUncommitted",
    ReadCommitted: "ReadCommitted",
    RepeatableRead: "RepeatableRead",
    Serializable: "Serializable",
  } as const);

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const UserScalarFieldEnum = {
    id: "id",
    email: "email",
    name: "name",
    password: "password",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    userRole: "userRole",
  } as const;

  export type UserScalarFieldEnum =
    (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const UserSettingScalarFieldEnum = {
    id: "id",
    userId: "userId",
    key: "key",
    value: "value",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  } as const;

  export type UserSettingScalarFieldEnum =
    (typeof UserSettingScalarFieldEnum)[keyof typeof UserSettingScalarFieldEnum];

  export const ServerSessionScalarFieldEnum = {
    id: "id",
    userId: "userId",
    origin: "origin",
    serverToken: "serverToken",
    serverType: "serverType",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  } as const;

  export type ServerSessionScalarFieldEnum =
    (typeof ServerSessionScalarFieldEnum)[keyof typeof ServerSessionScalarFieldEnum];

  export const ServerInfoScalarFieldEnum = {
    id: "id",
    serverSessionId: "serverSessionId",
    name: "name",
    iconUrl: "iconUrl",
    faviconUrl: "faviconUrl",
    themeColor: "themeColor",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  } as const;

  export type ServerInfoScalarFieldEnum =
    (typeof ServerInfoScalarFieldEnum)[keyof typeof ServerInfoScalarFieldEnum];

  export const UserInfoScalarFieldEnum = {
    id: "id",
    name: "name",
    username: "username",
    avatarUrl: "avatarUrl",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    serverSEssionId: "serverSEssionId",
    userId: "userId",
  } as const;

  export type UserInfoScalarFieldEnum =
    (typeof UserInfoScalarFieldEnum)[keyof typeof UserInfoScalarFieldEnum];

  export const PanelScalarFieldEnum = {
    id: "id",
    serverSessionId: "serverSessionId",
    type: "type",
  } as const;

  export type PanelScalarFieldEnum =
    (typeof PanelScalarFieldEnum)[keyof typeof PanelScalarFieldEnum];

  export const TimelineScalarFieldEnum = {
    id: "id",
    serverSessionId: "serverSessionId",
    name: "name",
    type: "type",
    listId: "listId",
    channelId: "channelId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  } as const;

  export type TimelineScalarFieldEnum =
    (typeof TimelineScalarFieldEnum)[keyof typeof TimelineScalarFieldEnum];

  export const SortOrder = {
    asc: "asc",
    desc: "desc",
  } as const;

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode = {
    default: "default",
    insensitive: "insensitive",
  } as const;

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder = {
    first: "first",
    last: "last",
  } as const;

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "String"
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "String[]"
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime"
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime[]"
  >;

  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "UserRole"
  >;

  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "UserRole[]"
  >;

  /**
   * Reference to a field of type 'ServerType'
   */
  export type EnumServerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "ServerType"
  >;

  /**
   * Reference to a field of type 'ServerType[]'
   */
  export type ListEnumServerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "ServerType[]"
  >;

  /**
   * Reference to a field of type 'TimelineType'
   */
  export type EnumTimelineTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "TimelineType"
  >;

  /**
   * Reference to a field of type 'TimelineType[]'
   */
  export type ListEnumTimelineTypeFieldRefInput<$PrismaModel> =
    FieldRefInputType<$PrismaModel, "TimelineType[]">;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Int"
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Int[]"
  >;

  /**
   * Deep Input Types
   */

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<"User"> | string;
    email?: StringFilter<"User"> | string;
    name?: StringNullableFilter<"User"> | string | null;
    password?: StringFilter<"User"> | string;
    createdAt?: DateTimeFilter<"User"> | Date | string;
    updatedAt?: DateTimeFilter<"User"> | Date | string;
    userRole?: EnumUserRoleFilter<"User"> | $Enums.UserRole;
    serverSession?: ServerSessionListRelationFilter;
    userSettings?: UserSettingListRelationFilter;
    userInfo?: UserInfoListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrderInput | SortOrder;
    password?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    userRole?: SortOrder;
    serverSession?: ServerSessionOrderByRelationAggregateInput;
    userSettings?: UserSettingOrderByRelationAggregateInput;
    userInfo?: UserInfoOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      email?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      name?: StringNullableFilter<"User"> | string | null;
      password?: StringFilter<"User"> | string;
      createdAt?: DateTimeFilter<"User"> | Date | string;
      updatedAt?: DateTimeFilter<"User"> | Date | string;
      userRole?: EnumUserRoleFilter<"User"> | $Enums.UserRole;
      serverSession?: ServerSessionListRelationFilter;
      userSettings?: UserSettingListRelationFilter;
      userInfo?: UserInfoListRelationFilter;
    },
    "id" | "email"
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrderInput | SortOrder;
    password?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    userRole?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"User"> | string;
    email?: StringWithAggregatesFilter<"User"> | string;
    name?: StringNullableWithAggregatesFilter<"User"> | string | null;
    password?: StringWithAggregatesFilter<"User"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
    userRole?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole;
  };

  export type UserSettingWhereInput = {
    AND?: UserSettingWhereInput | UserSettingWhereInput[];
    OR?: UserSettingWhereInput[];
    NOT?: UserSettingWhereInput | UserSettingWhereInput[];
    id?: StringFilter<"UserSetting"> | string;
    userId?: StringFilter<"UserSetting"> | string;
    key?: StringFilter<"UserSetting"> | string;
    value?: StringFilter<"UserSetting"> | string;
    createdAt?: DateTimeFilter<"UserSetting"> | Date | string;
    updatedAt?: DateTimeFilter<"UserSetting"> | Date | string;
    user?: Xor<UserScalarRelationFilter, UserWhereInput>;
  };

  export type UserSettingOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    key?: SortOrder;
    value?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type UserSettingWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: UserSettingWhereInput | UserSettingWhereInput[];
      OR?: UserSettingWhereInput[];
      NOT?: UserSettingWhereInput | UserSettingWhereInput[];
      userId?: StringFilter<"UserSetting"> | string;
      key?: StringFilter<"UserSetting"> | string;
      value?: StringFilter<"UserSetting"> | string;
      createdAt?: DateTimeFilter<"UserSetting"> | Date | string;
      updatedAt?: DateTimeFilter<"UserSetting"> | Date | string;
      user?: Xor<UserScalarRelationFilter, UserWhereInput>;
    },
    "id"
  >;

  export type UserSettingOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    key?: SortOrder;
    value?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: UserSettingCountOrderByAggregateInput;
    _max?: UserSettingMaxOrderByAggregateInput;
    _min?: UserSettingMinOrderByAggregateInput;
  };

  export type UserSettingScalarWhereWithAggregatesInput = {
    AND?:
      | UserSettingScalarWhereWithAggregatesInput
      | UserSettingScalarWhereWithAggregatesInput[];
    OR?: UserSettingScalarWhereWithAggregatesInput[];
    NOT?:
      | UserSettingScalarWhereWithAggregatesInput
      | UserSettingScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"UserSetting"> | string;
    userId?: StringWithAggregatesFilter<"UserSetting"> | string;
    key?: StringWithAggregatesFilter<"UserSetting"> | string;
    value?: StringWithAggregatesFilter<"UserSetting"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"UserSetting"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"UserSetting"> | Date | string;
  };

  export type ServerSessionWhereInput = {
    AND?: ServerSessionWhereInput | ServerSessionWhereInput[];
    OR?: ServerSessionWhereInput[];
    NOT?: ServerSessionWhereInput | ServerSessionWhereInput[];
    id?: StringFilter<"ServerSession"> | string;
    userId?: StringFilter<"ServerSession"> | string;
    origin?: StringFilter<"ServerSession"> | string;
    serverToken?: StringFilter<"ServerSession"> | string;
    serverType?: EnumServerTypeFilter<"ServerSession"> | $Enums.ServerType;
    createdAt?: DateTimeFilter<"ServerSession"> | Date | string;
    updatedAt?: DateTimeFilter<"ServerSession"> | Date | string;
    user?: Xor<UserScalarRelationFilter, UserWhereInput>;
    panels?: PanelListRelationFilter;
    serverInfo?: Xor<
      ServerInfoNullableScalarRelationFilter,
      ServerInfoWhereInput
    > | null;
    serverUserInfo?: Xor<
      UserInfoNullableScalarRelationFilter,
      UserInfoWhereInput
    > | null;
    Timeline?: TimelineListRelationFilter;
  };

  export type ServerSessionOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    origin?: SortOrder;
    serverToken?: SortOrder;
    serverType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
    panels?: PanelOrderByRelationAggregateInput;
    serverInfo?: ServerInfoOrderByWithRelationInput;
    serverUserInfo?: UserInfoOrderByWithRelationInput;
    Timeline?: TimelineOrderByRelationAggregateInput;
  };

  export type ServerSessionWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      origin_userId?: ServerSessionOriginUserIdCompoundUniqueInput;
      AND?: ServerSessionWhereInput | ServerSessionWhereInput[];
      OR?: ServerSessionWhereInput[];
      NOT?: ServerSessionWhereInput | ServerSessionWhereInput[];
      userId?: StringFilter<"ServerSession"> | string;
      origin?: StringFilter<"ServerSession"> | string;
      serverToken?: StringFilter<"ServerSession"> | string;
      serverType?: EnumServerTypeFilter<"ServerSession"> | $Enums.ServerType;
      createdAt?: DateTimeFilter<"ServerSession"> | Date | string;
      updatedAt?: DateTimeFilter<"ServerSession"> | Date | string;
      user?: Xor<UserScalarRelationFilter, UserWhereInput>;
      panels?: PanelListRelationFilter;
      serverInfo?: Xor<
        ServerInfoNullableScalarRelationFilter,
        ServerInfoWhereInput
      > | null;
      serverUserInfo?: Xor<
        UserInfoNullableScalarRelationFilter,
        UserInfoWhereInput
      > | null;
      Timeline?: TimelineListRelationFilter;
    },
    "id" | "origin_userId"
  >;

  export type ServerSessionOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    origin?: SortOrder;
    serverToken?: SortOrder;
    serverType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: ServerSessionCountOrderByAggregateInput;
    _max?: ServerSessionMaxOrderByAggregateInput;
    _min?: ServerSessionMinOrderByAggregateInput;
  };

  export type ServerSessionScalarWhereWithAggregatesInput = {
    AND?:
      | ServerSessionScalarWhereWithAggregatesInput
      | ServerSessionScalarWhereWithAggregatesInput[];
    OR?: ServerSessionScalarWhereWithAggregatesInput[];
    NOT?:
      | ServerSessionScalarWhereWithAggregatesInput
      | ServerSessionScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"ServerSession"> | string;
    userId?: StringWithAggregatesFilter<"ServerSession"> | string;
    origin?: StringWithAggregatesFilter<"ServerSession"> | string;
    serverToken?: StringWithAggregatesFilter<"ServerSession"> | string;
    serverType?:
      | EnumServerTypeWithAggregatesFilter<"ServerSession">
      | $Enums.ServerType;
    createdAt?: DateTimeWithAggregatesFilter<"ServerSession"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"ServerSession"> | Date | string;
  };

  export type ServerInfoWhereInput = {
    AND?: ServerInfoWhereInput | ServerInfoWhereInput[];
    OR?: ServerInfoWhereInput[];
    NOT?: ServerInfoWhereInput | ServerInfoWhereInput[];
    id?: StringFilter<"ServerInfo"> | string;
    serverSessionId?: StringFilter<"ServerInfo"> | string;
    name?: StringFilter<"ServerInfo"> | string;
    iconUrl?: StringFilter<"ServerInfo"> | string;
    faviconUrl?: StringFilter<"ServerInfo"> | string;
    themeColor?: StringFilter<"ServerInfo"> | string;
    createdAt?: DateTimeFilter<"ServerInfo"> | Date | string;
    updatedAt?: DateTimeFilter<"ServerInfo"> | Date | string;
    serverSession?: Xor<
      ServerSessionScalarRelationFilter,
      ServerSessionWhereInput
    >;
  };

  export type ServerInfoOrderByWithRelationInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    iconUrl?: SortOrder;
    faviconUrl?: SortOrder;
    themeColor?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSession?: ServerSessionOrderByWithRelationInput;
  };

  export type ServerInfoWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      serverSessionId?: string;
      AND?: ServerInfoWhereInput | ServerInfoWhereInput[];
      OR?: ServerInfoWhereInput[];
      NOT?: ServerInfoWhereInput | ServerInfoWhereInput[];
      name?: StringFilter<"ServerInfo"> | string;
      iconUrl?: StringFilter<"ServerInfo"> | string;
      faviconUrl?: StringFilter<"ServerInfo"> | string;
      themeColor?: StringFilter<"ServerInfo"> | string;
      createdAt?: DateTimeFilter<"ServerInfo"> | Date | string;
      updatedAt?: DateTimeFilter<"ServerInfo"> | Date | string;
      serverSession?: Xor<
        ServerSessionScalarRelationFilter,
        ServerSessionWhereInput
      >;
    },
    "id" | "serverSessionId"
  >;

  export type ServerInfoOrderByWithAggregationInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    iconUrl?: SortOrder;
    faviconUrl?: SortOrder;
    themeColor?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: ServerInfoCountOrderByAggregateInput;
    _max?: ServerInfoMaxOrderByAggregateInput;
    _min?: ServerInfoMinOrderByAggregateInput;
  };

  export type ServerInfoScalarWhereWithAggregatesInput = {
    AND?:
      | ServerInfoScalarWhereWithAggregatesInput
      | ServerInfoScalarWhereWithAggregatesInput[];
    OR?: ServerInfoScalarWhereWithAggregatesInput[];
    NOT?:
      | ServerInfoScalarWhereWithAggregatesInput
      | ServerInfoScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"ServerInfo"> | string;
    serverSessionId?: StringWithAggregatesFilter<"ServerInfo"> | string;
    name?: StringWithAggregatesFilter<"ServerInfo"> | string;
    iconUrl?: StringWithAggregatesFilter<"ServerInfo"> | string;
    faviconUrl?: StringWithAggregatesFilter<"ServerInfo"> | string;
    themeColor?: StringWithAggregatesFilter<"ServerInfo"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"ServerInfo"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"ServerInfo"> | Date | string;
  };

  export type UserInfoWhereInput = {
    AND?: UserInfoWhereInput | UserInfoWhereInput[];
    OR?: UserInfoWhereInput[];
    NOT?: UserInfoWhereInput | UserInfoWhereInput[];
    id?: StringFilter<"UserInfo"> | string;
    name?: StringFilter<"UserInfo"> | string;
    username?: StringFilter<"UserInfo"> | string;
    avatarUrl?: StringFilter<"UserInfo"> | string;
    createdAt?: DateTimeFilter<"UserInfo"> | Date | string;
    updatedAt?: DateTimeFilter<"UserInfo"> | Date | string;
    serverSEssionId?: StringFilter<"UserInfo"> | string;
    userId?: StringNullableFilter<"UserInfo"> | string | null;
    serverSession?: Xor<
      ServerSessionScalarRelationFilter,
      ServerSessionWhereInput
    >;
    User?: Xor<UserNullableScalarRelationFilter, UserWhereInput> | null;
  };

  export type UserInfoOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    username?: SortOrder;
    avatarUrl?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSEssionId?: SortOrder;
    userId?: SortOrderInput | SortOrder;
    serverSession?: ServerSessionOrderByWithRelationInput;
    User?: UserOrderByWithRelationInput;
  };

  export type UserInfoWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      serverSEssionId?: string;
      AND?: UserInfoWhereInput | UserInfoWhereInput[];
      OR?: UserInfoWhereInput[];
      NOT?: UserInfoWhereInput | UserInfoWhereInput[];
      name?: StringFilter<"UserInfo"> | string;
      username?: StringFilter<"UserInfo"> | string;
      avatarUrl?: StringFilter<"UserInfo"> | string;
      createdAt?: DateTimeFilter<"UserInfo"> | Date | string;
      updatedAt?: DateTimeFilter<"UserInfo"> | Date | string;
      userId?: StringNullableFilter<"UserInfo"> | string | null;
      serverSession?: Xor<
        ServerSessionScalarRelationFilter,
        ServerSessionWhereInput
      >;
      User?: Xor<UserNullableScalarRelationFilter, UserWhereInput> | null;
    },
    "id" | "serverSEssionId"
  >;

  export type UserInfoOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    username?: SortOrder;
    avatarUrl?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSEssionId?: SortOrder;
    userId?: SortOrderInput | SortOrder;
    _count?: UserInfoCountOrderByAggregateInput;
    _max?: UserInfoMaxOrderByAggregateInput;
    _min?: UserInfoMinOrderByAggregateInput;
  };

  export type UserInfoScalarWhereWithAggregatesInput = {
    AND?:
      | UserInfoScalarWhereWithAggregatesInput
      | UserInfoScalarWhereWithAggregatesInput[];
    OR?: UserInfoScalarWhereWithAggregatesInput[];
    NOT?:
      | UserInfoScalarWhereWithAggregatesInput
      | UserInfoScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"UserInfo"> | string;
    name?: StringWithAggregatesFilter<"UserInfo"> | string;
    username?: StringWithAggregatesFilter<"UserInfo"> | string;
    avatarUrl?: StringWithAggregatesFilter<"UserInfo"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"UserInfo"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"UserInfo"> | Date | string;
    serverSEssionId?: StringWithAggregatesFilter<"UserInfo"> | string;
    userId?: StringNullableWithAggregatesFilter<"UserInfo"> | string | null;
  };

  export type PanelWhereInput = {
    AND?: PanelWhereInput | PanelWhereInput[];
    OR?: PanelWhereInput[];
    NOT?: PanelWhereInput | PanelWhereInput[];
    id?: StringFilter<"Panel"> | string;
    serverSessionId?: StringFilter<"Panel"> | string;
    type?: StringFilter<"Panel"> | string;
    serverSession?: Xor<
      ServerSessionScalarRelationFilter,
      ServerSessionWhereInput
    >;
  };

  export type PanelOrderByWithRelationInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    type?: SortOrder;
    serverSession?: ServerSessionOrderByWithRelationInput;
  };

  export type PanelWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: PanelWhereInput | PanelWhereInput[];
      OR?: PanelWhereInput[];
      NOT?: PanelWhereInput | PanelWhereInput[];
      serverSessionId?: StringFilter<"Panel"> | string;
      type?: StringFilter<"Panel"> | string;
      serverSession?: Xor<
        ServerSessionScalarRelationFilter,
        ServerSessionWhereInput
      >;
    },
    "id"
  >;

  export type PanelOrderByWithAggregationInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    type?: SortOrder;
    _count?: PanelCountOrderByAggregateInput;
    _max?: PanelMaxOrderByAggregateInput;
    _min?: PanelMinOrderByAggregateInput;
  };

  export type PanelScalarWhereWithAggregatesInput = {
    AND?:
      | PanelScalarWhereWithAggregatesInput
      | PanelScalarWhereWithAggregatesInput[];
    OR?: PanelScalarWhereWithAggregatesInput[];
    NOT?:
      | PanelScalarWhereWithAggregatesInput
      | PanelScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Panel"> | string;
    serverSessionId?: StringWithAggregatesFilter<"Panel"> | string;
    type?: StringWithAggregatesFilter<"Panel"> | string;
  };

  export type TimelineWhereInput = {
    AND?: TimelineWhereInput | TimelineWhereInput[];
    OR?: TimelineWhereInput[];
    NOT?: TimelineWhereInput | TimelineWhereInput[];
    id?: StringFilter<"Timeline"> | string;
    serverSessionId?: StringFilter<"Timeline"> | string;
    name?: StringFilter<"Timeline"> | string;
    type?: EnumTimelineTypeFilter<"Timeline"> | $Enums.TimelineType;
    listId?: StringNullableFilter<"Timeline"> | string | null;
    channelId?: StringNullableFilter<"Timeline"> | string | null;
    createdAt?: DateTimeFilter<"Timeline"> | Date | string;
    updatedAt?: DateTimeFilter<"Timeline"> | Date | string;
    serverSession?: Xor<
      ServerSessionScalarRelationFilter,
      ServerSessionWhereInput
    >;
  };

  export type TimelineOrderByWithRelationInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    type?: SortOrder;
    listId?: SortOrderInput | SortOrder;
    channelId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSession?: ServerSessionOrderByWithRelationInput;
  };

  export type TimelineWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: TimelineWhereInput | TimelineWhereInput[];
      OR?: TimelineWhereInput[];
      NOT?: TimelineWhereInput | TimelineWhereInput[];
      serverSessionId?: StringFilter<"Timeline"> | string;
      name?: StringFilter<"Timeline"> | string;
      type?: EnumTimelineTypeFilter<"Timeline"> | $Enums.TimelineType;
      listId?: StringNullableFilter<"Timeline"> | string | null;
      channelId?: StringNullableFilter<"Timeline"> | string | null;
      createdAt?: DateTimeFilter<"Timeline"> | Date | string;
      updatedAt?: DateTimeFilter<"Timeline"> | Date | string;
      serverSession?: Xor<
        ServerSessionScalarRelationFilter,
        ServerSessionWhereInput
      >;
    },
    "id"
  >;

  export type TimelineOrderByWithAggregationInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    type?: SortOrder;
    listId?: SortOrderInput | SortOrder;
    channelId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: TimelineCountOrderByAggregateInput;
    _max?: TimelineMaxOrderByAggregateInput;
    _min?: TimelineMinOrderByAggregateInput;
  };

  export type TimelineScalarWhereWithAggregatesInput = {
    AND?:
      | TimelineScalarWhereWithAggregatesInput
      | TimelineScalarWhereWithAggregatesInput[];
    OR?: TimelineScalarWhereWithAggregatesInput[];
    NOT?:
      | TimelineScalarWhereWithAggregatesInput
      | TimelineScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Timeline"> | string;
    serverSessionId?: StringWithAggregatesFilter<"Timeline"> | string;
    name?: StringWithAggregatesFilter<"Timeline"> | string;
    type?:
      | EnumTimelineTypeWithAggregatesFilter<"Timeline">
      | $Enums.TimelineType;
    listId?: StringNullableWithAggregatesFilter<"Timeline"> | string | null;
    channelId?: StringNullableWithAggregatesFilter<"Timeline"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"Timeline"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"Timeline"> | Date | string;
  };

  export type UserCreateInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    serverSession?: ServerSessionCreateNestedManyWithoutUserInput;
    userSettings?: UserSettingCreateNestedManyWithoutUserInput;
    userInfo?: UserInfoCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    serverSession?: ServerSessionUncheckedCreateNestedManyWithoutUserInput;
    userSettings?: UserSettingUncheckedCreateNestedManyWithoutUserInput;
    userInfo?: UserInfoUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    serverSession?: ServerSessionUpdateManyWithoutUserNestedInput;
    userSettings?: UserSettingUpdateManyWithoutUserNestedInput;
    userInfo?: UserInfoUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    serverSession?: ServerSessionUncheckedUpdateManyWithoutUserNestedInput;
    userSettings?: UserSettingUncheckedUpdateManyWithoutUserNestedInput;
    userInfo?: UserInfoUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateManyInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
  };

  export type UserSettingCreateInput = {
    id?: string;
    key: string;
    value: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutUserSettingsInput;
  };

  export type UserSettingUncheckedCreateInput = {
    id?: string;
    userId: string;
    key: string;
    value: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutUserSettingsNestedInput;
  };

  export type UserSettingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingCreateManyInput = {
    id?: string;
    userId: string;
    key: string;
    value: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ServerSessionCreateInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutServerSessionInput;
    panels?: PanelCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionUncheckedCreateInput = {
    id?: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    panels?: PanelUncheckedCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineUncheckedCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutServerSessionNestedInput;
    panels?: PanelUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    panels?: PanelUncheckedUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUncheckedUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionCreateManyInput = {
    id?: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ServerSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ServerSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ServerInfoCreateInput = {
    id?: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSession: ServerSessionCreateNestedOneWithoutServerInfoInput;
  };

  export type ServerInfoUncheckedCreateInput = {
    id?: string;
    serverSessionId: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ServerInfoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    iconUrl?: StringFieldUpdateOperationsInput | string;
    faviconUrl?: StringFieldUpdateOperationsInput | string;
    themeColor?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSession?: ServerSessionUpdateOneRequiredWithoutServerInfoNestedInput;
  };

  export type ServerInfoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    serverSessionId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    iconUrl?: StringFieldUpdateOperationsInput | string;
    faviconUrl?: StringFieldUpdateOperationsInput | string;
    themeColor?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ServerInfoCreateManyInput = {
    id?: string;
    serverSessionId: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ServerInfoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    iconUrl?: StringFieldUpdateOperationsInput | string;
    faviconUrl?: StringFieldUpdateOperationsInput | string;
    themeColor?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ServerInfoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    serverSessionId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    iconUrl?: StringFieldUpdateOperationsInput | string;
    faviconUrl?: StringFieldUpdateOperationsInput | string;
    themeColor?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserInfoCreateInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSession: ServerSessionCreateNestedOneWithoutServerUserInfoInput;
    User?: UserCreateNestedOneWithoutUserInfoInput;
  };

  export type UserInfoUncheckedCreateInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSEssionId: string;
    userId?: string | null;
  };

  export type UserInfoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSession?: ServerSessionUpdateOneRequiredWithoutServerUserInfoNestedInput;
    User?: UserUpdateOneWithoutUserInfoNestedInput;
  };

  export type UserInfoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSEssionId?: StringFieldUpdateOperationsInput | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type UserInfoCreateManyInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSEssionId: string;
    userId?: string | null;
  };

  export type UserInfoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserInfoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSEssionId?: StringFieldUpdateOperationsInput | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type PanelCreateInput = {
    id?: string;
    type: string;
    serverSession: ServerSessionCreateNestedOneWithoutPanelsInput;
  };

  export type PanelUncheckedCreateInput = {
    id?: string;
    serverSessionId: string;
    type: string;
  };

  export type PanelUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    serverSession?: ServerSessionUpdateOneRequiredWithoutPanelsNestedInput;
  };

  export type PanelUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    serverSessionId?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
  };

  export type PanelCreateManyInput = {
    id?: string;
    serverSessionId: string;
    type: string;
  };

  export type PanelUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
  };

  export type PanelUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    serverSessionId?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
  };

  export type TimelineCreateInput = {
    id?: string;
    name: string;
    type: $Enums.TimelineType;
    listId?: string | null;
    channelId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSession: ServerSessionCreateNestedOneWithoutTimelineInput;
  };

  export type TimelineUncheckedCreateInput = {
    id?: string;
    serverSessionId: string;
    name: string;
    type: $Enums.TimelineType;
    listId?: string | null;
    channelId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TimelineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSession?: ServerSessionUpdateOneRequiredWithoutTimelineNestedInput;
  };

  export type TimelineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    serverSessionId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TimelineCreateManyInput = {
    id?: string;
    serverSessionId: string;
    name: string;
    type: $Enums.TimelineType;
    listId?: string | null;
    channelId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TimelineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TimelineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    serverSessionId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole;
  };

  export type ServerSessionListRelationFilter = {
    every?: ServerSessionWhereInput;
    some?: ServerSessionWhereInput;
    none?: ServerSessionWhereInput;
  };

  export type UserSettingListRelationFilter = {
    every?: UserSettingWhereInput;
    some?: UserSettingWhereInput;
    none?: UserSettingWhereInput;
  };

  export type UserInfoListRelationFilter = {
    every?: UserInfoWhereInput;
    some?: UserInfoWhereInput;
    none?: UserInfoWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type ServerSessionOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserSettingOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserInfoOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    userRole?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    userRole?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    userRole?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?:
      | NestedEnumUserRoleWithAggregatesFilter<$PrismaModel>
      | $Enums.UserRole;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumUserRoleFilter<$PrismaModel>;
    _max?: NestedEnumUserRoleFilter<$PrismaModel>;
  };

  export type UserScalarRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type UserSettingCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    key?: SortOrder;
    value?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserSettingMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    key?: SortOrder;
    value?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserSettingMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    key?: SortOrder;
    value?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type EnumServerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerType | EnumServerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumServerTypeFilter<$PrismaModel> | $Enums.ServerType;
  };

  export type PanelListRelationFilter = {
    every?: PanelWhereInput;
    some?: PanelWhereInput;
    none?: PanelWhereInput;
  };

  export type ServerInfoNullableScalarRelationFilter = {
    is?: ServerInfoWhereInput | null;
    isNot?: ServerInfoWhereInput | null;
  };

  export type UserInfoNullableScalarRelationFilter = {
    is?: UserInfoWhereInput | null;
    isNot?: UserInfoWhereInput | null;
  };

  export type TimelineListRelationFilter = {
    every?: TimelineWhereInput;
    some?: TimelineWhereInput;
    none?: TimelineWhereInput;
  };

  export type PanelOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type TimelineOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type ServerSessionOriginUserIdCompoundUniqueInput = {
    origin: string;
    userId: string;
  };

  export type ServerSessionCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    origin?: SortOrder;
    serverToken?: SortOrder;
    serverType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ServerSessionMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    origin?: SortOrder;
    serverToken?: SortOrder;
    serverType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ServerSessionMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    origin?: SortOrder;
    serverToken?: SortOrder;
    serverType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type EnumServerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerType | EnumServerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    not?:
      | NestedEnumServerTypeWithAggregatesFilter<$PrismaModel>
      | $Enums.ServerType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumServerTypeFilter<$PrismaModel>;
    _max?: NestedEnumServerTypeFilter<$PrismaModel>;
  };

  export type ServerSessionScalarRelationFilter = {
    is?: ServerSessionWhereInput;
    isNot?: ServerSessionWhereInput;
  };

  export type ServerInfoCountOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    iconUrl?: SortOrder;
    faviconUrl?: SortOrder;
    themeColor?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ServerInfoMaxOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    iconUrl?: SortOrder;
    faviconUrl?: SortOrder;
    themeColor?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ServerInfoMinOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    iconUrl?: SortOrder;
    faviconUrl?: SortOrder;
    themeColor?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null;
    isNot?: UserWhereInput | null;
  };

  export type UserInfoCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    username?: SortOrder;
    avatarUrl?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSEssionId?: SortOrder;
    userId?: SortOrder;
  };

  export type UserInfoMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    username?: SortOrder;
    avatarUrl?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSEssionId?: SortOrder;
    userId?: SortOrder;
  };

  export type UserInfoMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    username?: SortOrder;
    avatarUrl?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    serverSEssionId?: SortOrder;
    userId?: SortOrder;
  };

  export type PanelCountOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    type?: SortOrder;
  };

  export type PanelMaxOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    type?: SortOrder;
  };

  export type PanelMinOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    type?: SortOrder;
  };

  export type EnumTimelineTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineType | EnumTimelineTypeFieldRefInput<$PrismaModel>;
    in?:
      | $Enums.TimelineType[]
      | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
    notIn?:
      | $Enums.TimelineType[]
      | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumTimelineTypeFilter<$PrismaModel> | $Enums.TimelineType;
  };

  export type TimelineCountOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    type?: SortOrder;
    listId?: SortOrder;
    channelId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TimelineMaxOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    type?: SortOrder;
    listId?: SortOrder;
    channelId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TimelineMinOrderByAggregateInput = {
    id?: SortOrder;
    serverSessionId?: SortOrder;
    name?: SortOrder;
    type?: SortOrder;
    listId?: SortOrder;
    channelId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type EnumTimelineTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineType | EnumTimelineTypeFieldRefInput<$PrismaModel>;
    in?:
      | $Enums.TimelineType[]
      | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
    notIn?:
      | $Enums.TimelineType[]
      | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
    not?:
      | NestedEnumTimelineTypeWithAggregatesFilter<$PrismaModel>
      | $Enums.TimelineType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumTimelineTypeFilter<$PrismaModel>;
    _max?: NestedEnumTimelineTypeFilter<$PrismaModel>;
  };

  export type ServerSessionCreateNestedManyWithoutUserInput = {
    create?:
      | Xor<
          ServerSessionCreateWithoutUserInput,
          ServerSessionUncheckedCreateWithoutUserInput
        >
      | ServerSessionCreateWithoutUserInput[]
      | ServerSessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | ServerSessionCreateOrConnectWithoutUserInput
      | ServerSessionCreateOrConnectWithoutUserInput[];
    createMany?: ServerSessionCreateManyUserInputEnvelope;
    connect?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
  };

  export type UserSettingCreateNestedManyWithoutUserInput = {
    create?:
      | Xor<
          UserSettingCreateWithoutUserInput,
          UserSettingUncheckedCreateWithoutUserInput
        >
      | UserSettingCreateWithoutUserInput[]
      | UserSettingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserSettingCreateOrConnectWithoutUserInput
      | UserSettingCreateOrConnectWithoutUserInput[];
    createMany?: UserSettingCreateManyUserInputEnvelope;
    connect?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
  };

  export type UserInfoCreateNestedManyWithoutUserInput = {
    create?:
      | Xor<
          UserInfoCreateWithoutUserInput,
          UserInfoUncheckedCreateWithoutUserInput
        >
      | UserInfoCreateWithoutUserInput[]
      | UserInfoUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserInfoCreateOrConnectWithoutUserInput
      | UserInfoCreateOrConnectWithoutUserInput[];
    createMany?: UserInfoCreateManyUserInputEnvelope;
    connect?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
  };

  export type ServerSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | Xor<
          ServerSessionCreateWithoutUserInput,
          ServerSessionUncheckedCreateWithoutUserInput
        >
      | ServerSessionCreateWithoutUserInput[]
      | ServerSessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | ServerSessionCreateOrConnectWithoutUserInput
      | ServerSessionCreateOrConnectWithoutUserInput[];
    createMany?: ServerSessionCreateManyUserInputEnvelope;
    connect?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
  };

  export type UserSettingUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | Xor<
          UserSettingCreateWithoutUserInput,
          UserSettingUncheckedCreateWithoutUserInput
        >
      | UserSettingCreateWithoutUserInput[]
      | UserSettingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserSettingCreateOrConnectWithoutUserInput
      | UserSettingCreateOrConnectWithoutUserInput[];
    createMany?: UserSettingCreateManyUserInputEnvelope;
    connect?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
  };

  export type UserInfoUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | Xor<
          UserInfoCreateWithoutUserInput,
          UserInfoUncheckedCreateWithoutUserInput
        >
      | UserInfoCreateWithoutUserInput[]
      | UserInfoUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserInfoCreateOrConnectWithoutUserInput
      | UserInfoCreateOrConnectWithoutUserInput[];
    createMany?: UserInfoCreateManyUserInputEnvelope;
    connect?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole;
  };

  export type ServerSessionUpdateManyWithoutUserNestedInput = {
    create?:
      | Xor<
          ServerSessionCreateWithoutUserInput,
          ServerSessionUncheckedCreateWithoutUserInput
        >
      | ServerSessionCreateWithoutUserInput[]
      | ServerSessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | ServerSessionCreateOrConnectWithoutUserInput
      | ServerSessionCreateOrConnectWithoutUserInput[];
    upsert?:
      | ServerSessionUpsertWithWhereUniqueWithoutUserInput
      | ServerSessionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: ServerSessionCreateManyUserInputEnvelope;
    set?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
    disconnect?:
      | ServerSessionWhereUniqueInput
      | ServerSessionWhereUniqueInput[];
    delete?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
    connect?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
    update?:
      | ServerSessionUpdateWithWhereUniqueWithoutUserInput
      | ServerSessionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | ServerSessionUpdateManyWithWhereWithoutUserInput
      | ServerSessionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?:
      | ServerSessionScalarWhereInput
      | ServerSessionScalarWhereInput[];
  };

  export type UserSettingUpdateManyWithoutUserNestedInput = {
    create?:
      | Xor<
          UserSettingCreateWithoutUserInput,
          UserSettingUncheckedCreateWithoutUserInput
        >
      | UserSettingCreateWithoutUserInput[]
      | UserSettingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserSettingCreateOrConnectWithoutUserInput
      | UserSettingCreateOrConnectWithoutUserInput[];
    upsert?:
      | UserSettingUpsertWithWhereUniqueWithoutUserInput
      | UserSettingUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: UserSettingCreateManyUserInputEnvelope;
    set?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    disconnect?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    delete?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    connect?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    update?:
      | UserSettingUpdateWithWhereUniqueWithoutUserInput
      | UserSettingUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | UserSettingUpdateManyWithWhereWithoutUserInput
      | UserSettingUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: UserSettingScalarWhereInput | UserSettingScalarWhereInput[];
  };

  export type UserInfoUpdateManyWithoutUserNestedInput = {
    create?:
      | Xor<
          UserInfoCreateWithoutUserInput,
          UserInfoUncheckedCreateWithoutUserInput
        >
      | UserInfoCreateWithoutUserInput[]
      | UserInfoUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserInfoCreateOrConnectWithoutUserInput
      | UserInfoCreateOrConnectWithoutUserInput[];
    upsert?:
      | UserInfoUpsertWithWhereUniqueWithoutUserInput
      | UserInfoUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: UserInfoCreateManyUserInputEnvelope;
    set?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    disconnect?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    delete?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    connect?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    update?:
      | UserInfoUpdateWithWhereUniqueWithoutUserInput
      | UserInfoUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | UserInfoUpdateManyWithWhereWithoutUserInput
      | UserInfoUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: UserInfoScalarWhereInput | UserInfoScalarWhereInput[];
  };

  export type ServerSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | Xor<
          ServerSessionCreateWithoutUserInput,
          ServerSessionUncheckedCreateWithoutUserInput
        >
      | ServerSessionCreateWithoutUserInput[]
      | ServerSessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | ServerSessionCreateOrConnectWithoutUserInput
      | ServerSessionCreateOrConnectWithoutUserInput[];
    upsert?:
      | ServerSessionUpsertWithWhereUniqueWithoutUserInput
      | ServerSessionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: ServerSessionCreateManyUserInputEnvelope;
    set?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
    disconnect?:
      | ServerSessionWhereUniqueInput
      | ServerSessionWhereUniqueInput[];
    delete?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
    connect?: ServerSessionWhereUniqueInput | ServerSessionWhereUniqueInput[];
    update?:
      | ServerSessionUpdateWithWhereUniqueWithoutUserInput
      | ServerSessionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | ServerSessionUpdateManyWithWhereWithoutUserInput
      | ServerSessionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?:
      | ServerSessionScalarWhereInput
      | ServerSessionScalarWhereInput[];
  };

  export type UserSettingUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | Xor<
          UserSettingCreateWithoutUserInput,
          UserSettingUncheckedCreateWithoutUserInput
        >
      | UserSettingCreateWithoutUserInput[]
      | UserSettingUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserSettingCreateOrConnectWithoutUserInput
      | UserSettingCreateOrConnectWithoutUserInput[];
    upsert?:
      | UserSettingUpsertWithWhereUniqueWithoutUserInput
      | UserSettingUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: UserSettingCreateManyUserInputEnvelope;
    set?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    disconnect?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    delete?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    connect?: UserSettingWhereUniqueInput | UserSettingWhereUniqueInput[];
    update?:
      | UserSettingUpdateWithWhereUniqueWithoutUserInput
      | UserSettingUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | UserSettingUpdateManyWithWhereWithoutUserInput
      | UserSettingUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: UserSettingScalarWhereInput | UserSettingScalarWhereInput[];
  };

  export type UserInfoUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | Xor<
          UserInfoCreateWithoutUserInput,
          UserInfoUncheckedCreateWithoutUserInput
        >
      | UserInfoCreateWithoutUserInput[]
      | UserInfoUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserInfoCreateOrConnectWithoutUserInput
      | UserInfoCreateOrConnectWithoutUserInput[];
    upsert?:
      | UserInfoUpsertWithWhereUniqueWithoutUserInput
      | UserInfoUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: UserInfoCreateManyUserInputEnvelope;
    set?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    disconnect?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    delete?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    connect?: UserInfoWhereUniqueInput | UserInfoWhereUniqueInput[];
    update?:
      | UserInfoUpdateWithWhereUniqueWithoutUserInput
      | UserInfoUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | UserInfoUpdateManyWithWhereWithoutUserInput
      | UserInfoUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: UserInfoScalarWhereInput | UserInfoScalarWhereInput[];
  };

  export type UserCreateNestedOneWithoutUserSettingsInput = {
    create?: Xor<
      UserCreateWithoutUserSettingsInput,
      UserUncheckedCreateWithoutUserSettingsInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutUserSettingsInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneRequiredWithoutUserSettingsNestedInput = {
    create?: Xor<
      UserCreateWithoutUserSettingsInput,
      UserUncheckedCreateWithoutUserSettingsInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutUserSettingsInput;
    upsert?: UserUpsertWithoutUserSettingsInput;
    connect?: UserWhereUniqueInput;
    update?: Xor<
      Xor<
        UserUpdateToOneWithWhereWithoutUserSettingsInput,
        UserUpdateWithoutUserSettingsInput
      >,
      UserUncheckedUpdateWithoutUserSettingsInput
    >;
  };

  export type UserCreateNestedOneWithoutServerSessionInput = {
    create?: Xor<
      UserCreateWithoutServerSessionInput,
      UserUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutServerSessionInput;
    connect?: UserWhereUniqueInput;
  };

  export type PanelCreateNestedManyWithoutServerSessionInput = {
    create?:
      | Xor<
          PanelCreateWithoutServerSessionInput,
          PanelUncheckedCreateWithoutServerSessionInput
        >
      | PanelCreateWithoutServerSessionInput[]
      | PanelUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | PanelCreateOrConnectWithoutServerSessionInput
      | PanelCreateOrConnectWithoutServerSessionInput[];
    createMany?: PanelCreateManyServerSessionInputEnvelope;
    connect?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
  };

  export type ServerInfoCreateNestedOneWithoutServerSessionInput = {
    create?: Xor<
      ServerInfoCreateWithoutServerSessionInput,
      ServerInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: ServerInfoCreateOrConnectWithoutServerSessionInput;
    connect?: ServerInfoWhereUniqueInput;
  };

  export type UserInfoCreateNestedOneWithoutServerSessionInput = {
    create?: Xor<
      UserInfoCreateWithoutServerSessionInput,
      UserInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: UserInfoCreateOrConnectWithoutServerSessionInput;
    connect?: UserInfoWhereUniqueInput;
  };

  export type TimelineCreateNestedManyWithoutServerSessionInput = {
    create?:
      | Xor<
          TimelineCreateWithoutServerSessionInput,
          TimelineUncheckedCreateWithoutServerSessionInput
        >
      | TimelineCreateWithoutServerSessionInput[]
      | TimelineUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | TimelineCreateOrConnectWithoutServerSessionInput
      | TimelineCreateOrConnectWithoutServerSessionInput[];
    createMany?: TimelineCreateManyServerSessionInputEnvelope;
    connect?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
  };

  export type PanelUncheckedCreateNestedManyWithoutServerSessionInput = {
    create?:
      | Xor<
          PanelCreateWithoutServerSessionInput,
          PanelUncheckedCreateWithoutServerSessionInput
        >
      | PanelCreateWithoutServerSessionInput[]
      | PanelUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | PanelCreateOrConnectWithoutServerSessionInput
      | PanelCreateOrConnectWithoutServerSessionInput[];
    createMany?: PanelCreateManyServerSessionInputEnvelope;
    connect?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
  };

  export type ServerInfoUncheckedCreateNestedOneWithoutServerSessionInput = {
    create?: Xor<
      ServerInfoCreateWithoutServerSessionInput,
      ServerInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: ServerInfoCreateOrConnectWithoutServerSessionInput;
    connect?: ServerInfoWhereUniqueInput;
  };

  export type UserInfoUncheckedCreateNestedOneWithoutServerSessionInput = {
    create?: Xor<
      UserInfoCreateWithoutServerSessionInput,
      UserInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: UserInfoCreateOrConnectWithoutServerSessionInput;
    connect?: UserInfoWhereUniqueInput;
  };

  export type TimelineUncheckedCreateNestedManyWithoutServerSessionInput = {
    create?:
      | Xor<
          TimelineCreateWithoutServerSessionInput,
          TimelineUncheckedCreateWithoutServerSessionInput
        >
      | TimelineCreateWithoutServerSessionInput[]
      | TimelineUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | TimelineCreateOrConnectWithoutServerSessionInput
      | TimelineCreateOrConnectWithoutServerSessionInput[];
    createMany?: TimelineCreateManyServerSessionInputEnvelope;
    connect?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
  };

  export type EnumServerTypeFieldUpdateOperationsInput = {
    set?: $Enums.ServerType;
  };

  export type UserUpdateOneRequiredWithoutServerSessionNestedInput = {
    create?: Xor<
      UserCreateWithoutServerSessionInput,
      UserUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutServerSessionInput;
    upsert?: UserUpsertWithoutServerSessionInput;
    connect?: UserWhereUniqueInput;
    update?: Xor<
      Xor<
        UserUpdateToOneWithWhereWithoutServerSessionInput,
        UserUpdateWithoutServerSessionInput
      >,
      UserUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type PanelUpdateManyWithoutServerSessionNestedInput = {
    create?:
      | Xor<
          PanelCreateWithoutServerSessionInput,
          PanelUncheckedCreateWithoutServerSessionInput
        >
      | PanelCreateWithoutServerSessionInput[]
      | PanelUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | PanelCreateOrConnectWithoutServerSessionInput
      | PanelCreateOrConnectWithoutServerSessionInput[];
    upsert?:
      | PanelUpsertWithWhereUniqueWithoutServerSessionInput
      | PanelUpsertWithWhereUniqueWithoutServerSessionInput[];
    createMany?: PanelCreateManyServerSessionInputEnvelope;
    set?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    disconnect?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    delete?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    connect?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    update?:
      | PanelUpdateWithWhereUniqueWithoutServerSessionInput
      | PanelUpdateWithWhereUniqueWithoutServerSessionInput[];
    updateMany?:
      | PanelUpdateManyWithWhereWithoutServerSessionInput
      | PanelUpdateManyWithWhereWithoutServerSessionInput[];
    deleteMany?: PanelScalarWhereInput | PanelScalarWhereInput[];
  };

  export type ServerInfoUpdateOneWithoutServerSessionNestedInput = {
    create?: Xor<
      ServerInfoCreateWithoutServerSessionInput,
      ServerInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: ServerInfoCreateOrConnectWithoutServerSessionInput;
    upsert?: ServerInfoUpsertWithoutServerSessionInput;
    disconnect?: ServerInfoWhereInput | boolean;
    delete?: ServerInfoWhereInput | boolean;
    connect?: ServerInfoWhereUniqueInput;
    update?: Xor<
      Xor<
        ServerInfoUpdateToOneWithWhereWithoutServerSessionInput,
        ServerInfoUpdateWithoutServerSessionInput
      >,
      ServerInfoUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type UserInfoUpdateOneWithoutServerSessionNestedInput = {
    create?: Xor<
      UserInfoCreateWithoutServerSessionInput,
      UserInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: UserInfoCreateOrConnectWithoutServerSessionInput;
    upsert?: UserInfoUpsertWithoutServerSessionInput;
    disconnect?: UserInfoWhereInput | boolean;
    delete?: UserInfoWhereInput | boolean;
    connect?: UserInfoWhereUniqueInput;
    update?: Xor<
      Xor<
        UserInfoUpdateToOneWithWhereWithoutServerSessionInput,
        UserInfoUpdateWithoutServerSessionInput
      >,
      UserInfoUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type TimelineUpdateManyWithoutServerSessionNestedInput = {
    create?:
      | Xor<
          TimelineCreateWithoutServerSessionInput,
          TimelineUncheckedCreateWithoutServerSessionInput
        >
      | TimelineCreateWithoutServerSessionInput[]
      | TimelineUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | TimelineCreateOrConnectWithoutServerSessionInput
      | TimelineCreateOrConnectWithoutServerSessionInput[];
    upsert?:
      | TimelineUpsertWithWhereUniqueWithoutServerSessionInput
      | TimelineUpsertWithWhereUniqueWithoutServerSessionInput[];
    createMany?: TimelineCreateManyServerSessionInputEnvelope;
    set?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    disconnect?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    delete?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    connect?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    update?:
      | TimelineUpdateWithWhereUniqueWithoutServerSessionInput
      | TimelineUpdateWithWhereUniqueWithoutServerSessionInput[];
    updateMany?:
      | TimelineUpdateManyWithWhereWithoutServerSessionInput
      | TimelineUpdateManyWithWhereWithoutServerSessionInput[];
    deleteMany?: TimelineScalarWhereInput | TimelineScalarWhereInput[];
  };

  export type PanelUncheckedUpdateManyWithoutServerSessionNestedInput = {
    create?:
      | Xor<
          PanelCreateWithoutServerSessionInput,
          PanelUncheckedCreateWithoutServerSessionInput
        >
      | PanelCreateWithoutServerSessionInput[]
      | PanelUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | PanelCreateOrConnectWithoutServerSessionInput
      | PanelCreateOrConnectWithoutServerSessionInput[];
    upsert?:
      | PanelUpsertWithWhereUniqueWithoutServerSessionInput
      | PanelUpsertWithWhereUniqueWithoutServerSessionInput[];
    createMany?: PanelCreateManyServerSessionInputEnvelope;
    set?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    disconnect?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    delete?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    connect?: PanelWhereUniqueInput | PanelWhereUniqueInput[];
    update?:
      | PanelUpdateWithWhereUniqueWithoutServerSessionInput
      | PanelUpdateWithWhereUniqueWithoutServerSessionInput[];
    updateMany?:
      | PanelUpdateManyWithWhereWithoutServerSessionInput
      | PanelUpdateManyWithWhereWithoutServerSessionInput[];
    deleteMany?: PanelScalarWhereInput | PanelScalarWhereInput[];
  };

  export type ServerInfoUncheckedUpdateOneWithoutServerSessionNestedInput = {
    create?: Xor<
      ServerInfoCreateWithoutServerSessionInput,
      ServerInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: ServerInfoCreateOrConnectWithoutServerSessionInput;
    upsert?: ServerInfoUpsertWithoutServerSessionInput;
    disconnect?: ServerInfoWhereInput | boolean;
    delete?: ServerInfoWhereInput | boolean;
    connect?: ServerInfoWhereUniqueInput;
    update?: Xor<
      Xor<
        ServerInfoUpdateToOneWithWhereWithoutServerSessionInput,
        ServerInfoUpdateWithoutServerSessionInput
      >,
      ServerInfoUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type UserInfoUncheckedUpdateOneWithoutServerSessionNestedInput = {
    create?: Xor<
      UserInfoCreateWithoutServerSessionInput,
      UserInfoUncheckedCreateWithoutServerSessionInput
    >;
    connectOrCreate?: UserInfoCreateOrConnectWithoutServerSessionInput;
    upsert?: UserInfoUpsertWithoutServerSessionInput;
    disconnect?: UserInfoWhereInput | boolean;
    delete?: UserInfoWhereInput | boolean;
    connect?: UserInfoWhereUniqueInput;
    update?: Xor<
      Xor<
        UserInfoUpdateToOneWithWhereWithoutServerSessionInput,
        UserInfoUpdateWithoutServerSessionInput
      >,
      UserInfoUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type TimelineUncheckedUpdateManyWithoutServerSessionNestedInput = {
    create?:
      | Xor<
          TimelineCreateWithoutServerSessionInput,
          TimelineUncheckedCreateWithoutServerSessionInput
        >
      | TimelineCreateWithoutServerSessionInput[]
      | TimelineUncheckedCreateWithoutServerSessionInput[];
    connectOrCreate?:
      | TimelineCreateOrConnectWithoutServerSessionInput
      | TimelineCreateOrConnectWithoutServerSessionInput[];
    upsert?:
      | TimelineUpsertWithWhereUniqueWithoutServerSessionInput
      | TimelineUpsertWithWhereUniqueWithoutServerSessionInput[];
    createMany?: TimelineCreateManyServerSessionInputEnvelope;
    set?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    disconnect?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    delete?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    connect?: TimelineWhereUniqueInput | TimelineWhereUniqueInput[];
    update?:
      | TimelineUpdateWithWhereUniqueWithoutServerSessionInput
      | TimelineUpdateWithWhereUniqueWithoutServerSessionInput[];
    updateMany?:
      | TimelineUpdateManyWithWhereWithoutServerSessionInput
      | TimelineUpdateManyWithWhereWithoutServerSessionInput[];
    deleteMany?: TimelineScalarWhereInput | TimelineScalarWhereInput[];
  };

  export type ServerSessionCreateNestedOneWithoutServerInfoInput = {
    create?: Xor<
      ServerSessionCreateWithoutServerInfoInput,
      ServerSessionUncheckedCreateWithoutServerInfoInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutServerInfoInput;
    connect?: ServerSessionWhereUniqueInput;
  };

  export type ServerSessionUpdateOneRequiredWithoutServerInfoNestedInput = {
    create?: Xor<
      ServerSessionCreateWithoutServerInfoInput,
      ServerSessionUncheckedCreateWithoutServerInfoInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutServerInfoInput;
    upsert?: ServerSessionUpsertWithoutServerInfoInput;
    connect?: ServerSessionWhereUniqueInput;
    update?: Xor<
      Xor<
        ServerSessionUpdateToOneWithWhereWithoutServerInfoInput,
        ServerSessionUpdateWithoutServerInfoInput
      >,
      ServerSessionUncheckedUpdateWithoutServerInfoInput
    >;
  };

  export type ServerSessionCreateNestedOneWithoutServerUserInfoInput = {
    create?: Xor<
      ServerSessionCreateWithoutServerUserInfoInput,
      ServerSessionUncheckedCreateWithoutServerUserInfoInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutServerUserInfoInput;
    connect?: ServerSessionWhereUniqueInput;
  };

  export type UserCreateNestedOneWithoutUserInfoInput = {
    create?: Xor<
      UserCreateWithoutUserInfoInput,
      UserUncheckedCreateWithoutUserInfoInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutUserInfoInput;
    connect?: UserWhereUniqueInput;
  };

  export type ServerSessionUpdateOneRequiredWithoutServerUserInfoNestedInput = {
    create?: Xor<
      ServerSessionCreateWithoutServerUserInfoInput,
      ServerSessionUncheckedCreateWithoutServerUserInfoInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutServerUserInfoInput;
    upsert?: ServerSessionUpsertWithoutServerUserInfoInput;
    connect?: ServerSessionWhereUniqueInput;
    update?: Xor<
      Xor<
        ServerSessionUpdateToOneWithWhereWithoutServerUserInfoInput,
        ServerSessionUpdateWithoutServerUserInfoInput
      >,
      ServerSessionUncheckedUpdateWithoutServerUserInfoInput
    >;
  };

  export type UserUpdateOneWithoutUserInfoNestedInput = {
    create?: Xor<
      UserCreateWithoutUserInfoInput,
      UserUncheckedCreateWithoutUserInfoInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutUserInfoInput;
    upsert?: UserUpsertWithoutUserInfoInput;
    disconnect?: UserWhereInput | boolean;
    delete?: UserWhereInput | boolean;
    connect?: UserWhereUniqueInput;
    update?: Xor<
      Xor<
        UserUpdateToOneWithWhereWithoutUserInfoInput,
        UserUpdateWithoutUserInfoInput
      >,
      UserUncheckedUpdateWithoutUserInfoInput
    >;
  };

  export type ServerSessionCreateNestedOneWithoutPanelsInput = {
    create?: Xor<
      ServerSessionCreateWithoutPanelsInput,
      ServerSessionUncheckedCreateWithoutPanelsInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutPanelsInput;
    connect?: ServerSessionWhereUniqueInput;
  };

  export type ServerSessionUpdateOneRequiredWithoutPanelsNestedInput = {
    create?: Xor<
      ServerSessionCreateWithoutPanelsInput,
      ServerSessionUncheckedCreateWithoutPanelsInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutPanelsInput;
    upsert?: ServerSessionUpsertWithoutPanelsInput;
    connect?: ServerSessionWhereUniqueInput;
    update?: Xor<
      Xor<
        ServerSessionUpdateToOneWithWhereWithoutPanelsInput,
        ServerSessionUpdateWithoutPanelsInput
      >,
      ServerSessionUncheckedUpdateWithoutPanelsInput
    >;
  };

  export type ServerSessionCreateNestedOneWithoutTimelineInput = {
    create?: Xor<
      ServerSessionCreateWithoutTimelineInput,
      ServerSessionUncheckedCreateWithoutTimelineInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutTimelineInput;
    connect?: ServerSessionWhereUniqueInput;
  };

  export type EnumTimelineTypeFieldUpdateOperationsInput = {
    set?: $Enums.TimelineType;
  };

  export type ServerSessionUpdateOneRequiredWithoutTimelineNestedInput = {
    create?: Xor<
      ServerSessionCreateWithoutTimelineInput,
      ServerSessionUncheckedCreateWithoutTimelineInput
    >;
    connectOrCreate?: ServerSessionCreateOrConnectWithoutTimelineInput;
    upsert?: ServerSessionUpsertWithoutTimelineInput;
    connect?: ServerSessionWhereUniqueInput;
    update?: Xor<
      Xor<
        ServerSessionUpdateToOneWithWhereWithoutTimelineInput,
        ServerSessionUpdateWithoutTimelineInput
      >,
      ServerSessionUncheckedUpdateWithoutTimelineInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?:
      | NestedEnumUserRoleWithAggregatesFilter<$PrismaModel>
      | $Enums.UserRole;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumUserRoleFilter<$PrismaModel>;
    _max?: NestedEnumUserRoleFilter<$PrismaModel>;
  };

  export type NestedEnumServerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerType | EnumServerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumServerTypeFilter<$PrismaModel> | $Enums.ServerType;
  };

  export type NestedEnumServerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServerType | EnumServerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServerType[] | ListEnumServerTypeFieldRefInput<$PrismaModel>;
    not?:
      | NestedEnumServerTypeWithAggregatesFilter<$PrismaModel>
      | $Enums.ServerType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumServerTypeFilter<$PrismaModel>;
    _max?: NestedEnumServerTypeFilter<$PrismaModel>;
  };

  export type NestedEnumTimelineTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TimelineType | EnumTimelineTypeFieldRefInput<$PrismaModel>;
    in?:
      | $Enums.TimelineType[]
      | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
    notIn?:
      | $Enums.TimelineType[]
      | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumTimelineTypeFilter<$PrismaModel> | $Enums.TimelineType;
  };

  export type NestedEnumTimelineTypeWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?:
        | $Enums.TimelineType
        | EnumTimelineTypeFieldRefInput<$PrismaModel>;
      in?:
        | $Enums.TimelineType[]
        | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
      notIn?:
        | $Enums.TimelineType[]
        | ListEnumTimelineTypeFieldRefInput<$PrismaModel>;
      not?:
        | NestedEnumTimelineTypeWithAggregatesFilter<$PrismaModel>
        | $Enums.TimelineType;
      _count?: NestedIntFilter<$PrismaModel>;
      _min?: NestedEnumTimelineTypeFilter<$PrismaModel>;
      _max?: NestedEnumTimelineTypeFilter<$PrismaModel>;
    };

  export type ServerSessionCreateWithoutUserInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    panels?: PanelCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionUncheckedCreateWithoutUserInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    panels?: PanelUncheckedCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineUncheckedCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionCreateOrConnectWithoutUserInput = {
    where: ServerSessionWhereUniqueInput;
    create: Xor<
      ServerSessionCreateWithoutUserInput,
      ServerSessionUncheckedCreateWithoutUserInput
    >;
  };

  export type ServerSessionCreateManyUserInputEnvelope = {
    data: ServerSessionCreateManyUserInput | ServerSessionCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type UserSettingCreateWithoutUserInput = {
    id?: string;
    key: string;
    value: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingUncheckedCreateWithoutUserInput = {
    id?: string;
    key: string;
    value: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingCreateOrConnectWithoutUserInput = {
    where: UserSettingWhereUniqueInput;
    create: Xor<
      UserSettingCreateWithoutUserInput,
      UserSettingUncheckedCreateWithoutUserInput
    >;
  };

  export type UserSettingCreateManyUserInputEnvelope = {
    data: UserSettingCreateManyUserInput | UserSettingCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type UserInfoCreateWithoutUserInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSession: ServerSessionCreateNestedOneWithoutServerUserInfoInput;
  };

  export type UserInfoUncheckedCreateWithoutUserInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSEssionId: string;
  };

  export type UserInfoCreateOrConnectWithoutUserInput = {
    where: UserInfoWhereUniqueInput;
    create: Xor<
      UserInfoCreateWithoutUserInput,
      UserInfoUncheckedCreateWithoutUserInput
    >;
  };

  export type UserInfoCreateManyUserInputEnvelope = {
    data: UserInfoCreateManyUserInput | UserInfoCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type ServerSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: ServerSessionWhereUniqueInput;
    update: Xor<
      ServerSessionUpdateWithoutUserInput,
      ServerSessionUncheckedUpdateWithoutUserInput
    >;
    create: Xor<
      ServerSessionCreateWithoutUserInput,
      ServerSessionUncheckedCreateWithoutUserInput
    >;
  };

  export type ServerSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: ServerSessionWhereUniqueInput;
    data: Xor<
      ServerSessionUpdateWithoutUserInput,
      ServerSessionUncheckedUpdateWithoutUserInput
    >;
  };

  export type ServerSessionUpdateManyWithWhereWithoutUserInput = {
    where: ServerSessionScalarWhereInput;
    data: Xor<
      ServerSessionUpdateManyMutationInput,
      ServerSessionUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type ServerSessionScalarWhereInput = {
    AND?: ServerSessionScalarWhereInput | ServerSessionScalarWhereInput[];
    OR?: ServerSessionScalarWhereInput[];
    NOT?: ServerSessionScalarWhereInput | ServerSessionScalarWhereInput[];
    id?: StringFilter<"ServerSession"> | string;
    userId?: StringFilter<"ServerSession"> | string;
    origin?: StringFilter<"ServerSession"> | string;
    serverToken?: StringFilter<"ServerSession"> | string;
    serverType?: EnumServerTypeFilter<"ServerSession"> | $Enums.ServerType;
    createdAt?: DateTimeFilter<"ServerSession"> | Date | string;
    updatedAt?: DateTimeFilter<"ServerSession"> | Date | string;
  };

  export type UserSettingUpsertWithWhereUniqueWithoutUserInput = {
    where: UserSettingWhereUniqueInput;
    update: Xor<
      UserSettingUpdateWithoutUserInput,
      UserSettingUncheckedUpdateWithoutUserInput
    >;
    create: Xor<
      UserSettingCreateWithoutUserInput,
      UserSettingUncheckedCreateWithoutUserInput
    >;
  };

  export type UserSettingUpdateWithWhereUniqueWithoutUserInput = {
    where: UserSettingWhereUniqueInput;
    data: Xor<
      UserSettingUpdateWithoutUserInput,
      UserSettingUncheckedUpdateWithoutUserInput
    >;
  };

  export type UserSettingUpdateManyWithWhereWithoutUserInput = {
    where: UserSettingScalarWhereInput;
    data: Xor<
      UserSettingUpdateManyMutationInput,
      UserSettingUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type UserSettingScalarWhereInput = {
    AND?: UserSettingScalarWhereInput | UserSettingScalarWhereInput[];
    OR?: UserSettingScalarWhereInput[];
    NOT?: UserSettingScalarWhereInput | UserSettingScalarWhereInput[];
    id?: StringFilter<"UserSetting"> | string;
    userId?: StringFilter<"UserSetting"> | string;
    key?: StringFilter<"UserSetting"> | string;
    value?: StringFilter<"UserSetting"> | string;
    createdAt?: DateTimeFilter<"UserSetting"> | Date | string;
    updatedAt?: DateTimeFilter<"UserSetting"> | Date | string;
  };

  export type UserInfoUpsertWithWhereUniqueWithoutUserInput = {
    where: UserInfoWhereUniqueInput;
    update: Xor<
      UserInfoUpdateWithoutUserInput,
      UserInfoUncheckedUpdateWithoutUserInput
    >;
    create: Xor<
      UserInfoCreateWithoutUserInput,
      UserInfoUncheckedCreateWithoutUserInput
    >;
  };

  export type UserInfoUpdateWithWhereUniqueWithoutUserInput = {
    where: UserInfoWhereUniqueInput;
    data: Xor<
      UserInfoUpdateWithoutUserInput,
      UserInfoUncheckedUpdateWithoutUserInput
    >;
  };

  export type UserInfoUpdateManyWithWhereWithoutUserInput = {
    where: UserInfoScalarWhereInput;
    data: Xor<
      UserInfoUpdateManyMutationInput,
      UserInfoUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type UserInfoScalarWhereInput = {
    AND?: UserInfoScalarWhereInput | UserInfoScalarWhereInput[];
    OR?: UserInfoScalarWhereInput[];
    NOT?: UserInfoScalarWhereInput | UserInfoScalarWhereInput[];
    id?: StringFilter<"UserInfo"> | string;
    name?: StringFilter<"UserInfo"> | string;
    username?: StringFilter<"UserInfo"> | string;
    avatarUrl?: StringFilter<"UserInfo"> | string;
    createdAt?: DateTimeFilter<"UserInfo"> | Date | string;
    updatedAt?: DateTimeFilter<"UserInfo"> | Date | string;
    serverSEssionId?: StringFilter<"UserInfo"> | string;
    userId?: StringNullableFilter<"UserInfo"> | string | null;
  };

  export type UserCreateWithoutUserSettingsInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    serverSession?: ServerSessionCreateNestedManyWithoutUserInput;
    userInfo?: UserInfoCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutUserSettingsInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    serverSession?: ServerSessionUncheckedCreateNestedManyWithoutUserInput;
    userInfo?: UserInfoUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutUserSettingsInput = {
    where: UserWhereUniqueInput;
    create: Xor<
      UserCreateWithoutUserSettingsInput,
      UserUncheckedCreateWithoutUserSettingsInput
    >;
  };

  export type UserUpsertWithoutUserSettingsInput = {
    update: Xor<
      UserUpdateWithoutUserSettingsInput,
      UserUncheckedUpdateWithoutUserSettingsInput
    >;
    create: Xor<
      UserCreateWithoutUserSettingsInput,
      UserUncheckedCreateWithoutUserSettingsInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutUserSettingsInput = {
    where?: UserWhereInput;
    data: Xor<
      UserUpdateWithoutUserSettingsInput,
      UserUncheckedUpdateWithoutUserSettingsInput
    >;
  };

  export type UserUpdateWithoutUserSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    serverSession?: ServerSessionUpdateManyWithoutUserNestedInput;
    userInfo?: UserInfoUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutUserSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    serverSession?: ServerSessionUncheckedUpdateManyWithoutUserNestedInput;
    userInfo?: UserInfoUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutServerSessionInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    userSettings?: UserSettingCreateNestedManyWithoutUserInput;
    userInfo?: UserInfoCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutServerSessionInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    userSettings?: UserSettingUncheckedCreateNestedManyWithoutUserInput;
    userInfo?: UserInfoUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutServerSessionInput = {
    where: UserWhereUniqueInput;
    create: Xor<
      UserCreateWithoutServerSessionInput,
      UserUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type PanelCreateWithoutServerSessionInput = {
    id?: string;
    type: string;
  };

  export type PanelUncheckedCreateWithoutServerSessionInput = {
    id?: string;
    type: string;
  };

  export type PanelCreateOrConnectWithoutServerSessionInput = {
    where: PanelWhereUniqueInput;
    create: Xor<
      PanelCreateWithoutServerSessionInput,
      PanelUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type PanelCreateManyServerSessionInputEnvelope = {
    data:
      | PanelCreateManyServerSessionInput
      | PanelCreateManyServerSessionInput[];
    skipDuplicates?: boolean;
  };

  export type ServerInfoCreateWithoutServerSessionInput = {
    id?: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ServerInfoUncheckedCreateWithoutServerSessionInput = {
    id?: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ServerInfoCreateOrConnectWithoutServerSessionInput = {
    where: ServerInfoWhereUniqueInput;
    create: Xor<
      ServerInfoCreateWithoutServerSessionInput,
      ServerInfoUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type UserInfoCreateWithoutServerSessionInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    User?: UserCreateNestedOneWithoutUserInfoInput;
  };

  export type UserInfoUncheckedCreateWithoutServerSessionInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId?: string | null;
  };

  export type UserInfoCreateOrConnectWithoutServerSessionInput = {
    where: UserInfoWhereUniqueInput;
    create: Xor<
      UserInfoCreateWithoutServerSessionInput,
      UserInfoUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type TimelineCreateWithoutServerSessionInput = {
    id?: string;
    name: string;
    type: $Enums.TimelineType;
    listId?: string | null;
    channelId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TimelineUncheckedCreateWithoutServerSessionInput = {
    id?: string;
    name: string;
    type: $Enums.TimelineType;
    listId?: string | null;
    channelId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TimelineCreateOrConnectWithoutServerSessionInput = {
    where: TimelineWhereUniqueInput;
    create: Xor<
      TimelineCreateWithoutServerSessionInput,
      TimelineUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type TimelineCreateManyServerSessionInputEnvelope = {
    data:
      | TimelineCreateManyServerSessionInput
      | TimelineCreateManyServerSessionInput[];
    skipDuplicates?: boolean;
  };

  export type UserUpsertWithoutServerSessionInput = {
    update: Xor<
      UserUpdateWithoutServerSessionInput,
      UserUncheckedUpdateWithoutServerSessionInput
    >;
    create: Xor<
      UserCreateWithoutServerSessionInput,
      UserUncheckedCreateWithoutServerSessionInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutServerSessionInput = {
    where?: UserWhereInput;
    data: Xor<
      UserUpdateWithoutServerSessionInput,
      UserUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type UserUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    userSettings?: UserSettingUpdateManyWithoutUserNestedInput;
    userInfo?: UserInfoUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    userSettings?: UserSettingUncheckedUpdateManyWithoutUserNestedInput;
    userInfo?: UserInfoUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type PanelUpsertWithWhereUniqueWithoutServerSessionInput = {
    where: PanelWhereUniqueInput;
    update: Xor<
      PanelUpdateWithoutServerSessionInput,
      PanelUncheckedUpdateWithoutServerSessionInput
    >;
    create: Xor<
      PanelCreateWithoutServerSessionInput,
      PanelUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type PanelUpdateWithWhereUniqueWithoutServerSessionInput = {
    where: PanelWhereUniqueInput;
    data: Xor<
      PanelUpdateWithoutServerSessionInput,
      PanelUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type PanelUpdateManyWithWhereWithoutServerSessionInput = {
    where: PanelScalarWhereInput;
    data: Xor<
      PanelUpdateManyMutationInput,
      PanelUncheckedUpdateManyWithoutServerSessionInput
    >;
  };

  export type PanelScalarWhereInput = {
    AND?: PanelScalarWhereInput | PanelScalarWhereInput[];
    OR?: PanelScalarWhereInput[];
    NOT?: PanelScalarWhereInput | PanelScalarWhereInput[];
    id?: StringFilter<"Panel"> | string;
    serverSessionId?: StringFilter<"Panel"> | string;
    type?: StringFilter<"Panel"> | string;
  };

  export type ServerInfoUpsertWithoutServerSessionInput = {
    update: Xor<
      ServerInfoUpdateWithoutServerSessionInput,
      ServerInfoUncheckedUpdateWithoutServerSessionInput
    >;
    create: Xor<
      ServerInfoCreateWithoutServerSessionInput,
      ServerInfoUncheckedCreateWithoutServerSessionInput
    >;
    where?: ServerInfoWhereInput;
  };

  export type ServerInfoUpdateToOneWithWhereWithoutServerSessionInput = {
    where?: ServerInfoWhereInput;
    data: Xor<
      ServerInfoUpdateWithoutServerSessionInput,
      ServerInfoUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type ServerInfoUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    iconUrl?: StringFieldUpdateOperationsInput | string;
    faviconUrl?: StringFieldUpdateOperationsInput | string;
    themeColor?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ServerInfoUncheckedUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    iconUrl?: StringFieldUpdateOperationsInput | string;
    faviconUrl?: StringFieldUpdateOperationsInput | string;
    themeColor?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserInfoUpsertWithoutServerSessionInput = {
    update: Xor<
      UserInfoUpdateWithoutServerSessionInput,
      UserInfoUncheckedUpdateWithoutServerSessionInput
    >;
    create: Xor<
      UserInfoCreateWithoutServerSessionInput,
      UserInfoUncheckedCreateWithoutServerSessionInput
    >;
    where?: UserInfoWhereInput;
  };

  export type UserInfoUpdateToOneWithWhereWithoutServerSessionInput = {
    where?: UserInfoWhereInput;
    data: Xor<
      UserInfoUpdateWithoutServerSessionInput,
      UserInfoUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type UserInfoUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    User?: UserUpdateOneWithoutUserInfoNestedInput;
  };

  export type UserInfoUncheckedUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type TimelineUpsertWithWhereUniqueWithoutServerSessionInput = {
    where: TimelineWhereUniqueInput;
    update: Xor<
      TimelineUpdateWithoutServerSessionInput,
      TimelineUncheckedUpdateWithoutServerSessionInput
    >;
    create: Xor<
      TimelineCreateWithoutServerSessionInput,
      TimelineUncheckedCreateWithoutServerSessionInput
    >;
  };

  export type TimelineUpdateWithWhereUniqueWithoutServerSessionInput = {
    where: TimelineWhereUniqueInput;
    data: Xor<
      TimelineUpdateWithoutServerSessionInput,
      TimelineUncheckedUpdateWithoutServerSessionInput
    >;
  };

  export type TimelineUpdateManyWithWhereWithoutServerSessionInput = {
    where: TimelineScalarWhereInput;
    data: Xor<
      TimelineUpdateManyMutationInput,
      TimelineUncheckedUpdateManyWithoutServerSessionInput
    >;
  };

  export type TimelineScalarWhereInput = {
    AND?: TimelineScalarWhereInput | TimelineScalarWhereInput[];
    OR?: TimelineScalarWhereInput[];
    NOT?: TimelineScalarWhereInput | TimelineScalarWhereInput[];
    id?: StringFilter<"Timeline"> | string;
    serverSessionId?: StringFilter<"Timeline"> | string;
    name?: StringFilter<"Timeline"> | string;
    type?: EnumTimelineTypeFilter<"Timeline"> | $Enums.TimelineType;
    listId?: StringNullableFilter<"Timeline"> | string | null;
    channelId?: StringNullableFilter<"Timeline"> | string | null;
    createdAt?: DateTimeFilter<"Timeline"> | Date | string;
    updatedAt?: DateTimeFilter<"Timeline"> | Date | string;
  };

  export type ServerSessionCreateWithoutServerInfoInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutServerSessionInput;
    panels?: PanelCreateNestedManyWithoutServerSessionInput;
    serverUserInfo?: UserInfoCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionUncheckedCreateWithoutServerInfoInput = {
    id?: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    panels?: PanelUncheckedCreateNestedManyWithoutServerSessionInput;
    serverUserInfo?: UserInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineUncheckedCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionCreateOrConnectWithoutServerInfoInput = {
    where: ServerSessionWhereUniqueInput;
    create: Xor<
      ServerSessionCreateWithoutServerInfoInput,
      ServerSessionUncheckedCreateWithoutServerInfoInput
    >;
  };

  export type ServerSessionUpsertWithoutServerInfoInput = {
    update: Xor<
      ServerSessionUpdateWithoutServerInfoInput,
      ServerSessionUncheckedUpdateWithoutServerInfoInput
    >;
    create: Xor<
      ServerSessionCreateWithoutServerInfoInput,
      ServerSessionUncheckedCreateWithoutServerInfoInput
    >;
    where?: ServerSessionWhereInput;
  };

  export type ServerSessionUpdateToOneWithWhereWithoutServerInfoInput = {
    where?: ServerSessionWhereInput;
    data: Xor<
      ServerSessionUpdateWithoutServerInfoInput,
      ServerSessionUncheckedUpdateWithoutServerInfoInput
    >;
  };

  export type ServerSessionUpdateWithoutServerInfoInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutServerSessionNestedInput;
    panels?: PanelUpdateManyWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateWithoutServerInfoInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    panels?: PanelUncheckedUpdateManyWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUncheckedUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionCreateWithoutServerUserInfoInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutServerSessionInput;
    panels?: PanelCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionUncheckedCreateWithoutServerUserInfoInput = {
    id?: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    panels?: PanelUncheckedCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineUncheckedCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionCreateOrConnectWithoutServerUserInfoInput = {
    where: ServerSessionWhereUniqueInput;
    create: Xor<
      ServerSessionCreateWithoutServerUserInfoInput,
      ServerSessionUncheckedCreateWithoutServerUserInfoInput
    >;
  };

  export type UserCreateWithoutUserInfoInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    serverSession?: ServerSessionCreateNestedManyWithoutUserInput;
    userSettings?: UserSettingCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutUserInfoInput = {
    id?: string;
    email: string;
    name?: string | null;
    password: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userRole?: $Enums.UserRole;
    serverSession?: ServerSessionUncheckedCreateNestedManyWithoutUserInput;
    userSettings?: UserSettingUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutUserInfoInput = {
    where: UserWhereUniqueInput;
    create: Xor<
      UserCreateWithoutUserInfoInput,
      UserUncheckedCreateWithoutUserInfoInput
    >;
  };

  export type ServerSessionUpsertWithoutServerUserInfoInput = {
    update: Xor<
      ServerSessionUpdateWithoutServerUserInfoInput,
      ServerSessionUncheckedUpdateWithoutServerUserInfoInput
    >;
    create: Xor<
      ServerSessionCreateWithoutServerUserInfoInput,
      ServerSessionUncheckedCreateWithoutServerUserInfoInput
    >;
    where?: ServerSessionWhereInput;
  };

  export type ServerSessionUpdateToOneWithWhereWithoutServerUserInfoInput = {
    where?: ServerSessionWhereInput;
    data: Xor<
      ServerSessionUpdateWithoutServerUserInfoInput,
      ServerSessionUncheckedUpdateWithoutServerUserInfoInput
    >;
  };

  export type ServerSessionUpdateWithoutServerUserInfoInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutServerSessionNestedInput;
    panels?: PanelUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateWithoutServerUserInfoInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    panels?: PanelUncheckedUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUncheckedUpdateManyWithoutServerSessionNestedInput;
  };

  export type UserUpsertWithoutUserInfoInput = {
    update: Xor<
      UserUpdateWithoutUserInfoInput,
      UserUncheckedUpdateWithoutUserInfoInput
    >;
    create: Xor<
      UserCreateWithoutUserInfoInput,
      UserUncheckedCreateWithoutUserInfoInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutUserInfoInput = {
    where?: UserWhereInput;
    data: Xor<
      UserUpdateWithoutUserInfoInput,
      UserUncheckedUpdateWithoutUserInfoInput
    >;
  };

  export type UserUpdateWithoutUserInfoInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    serverSession?: ServerSessionUpdateManyWithoutUserNestedInput;
    userSettings?: UserSettingUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutUserInfoInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: NullableStringFieldUpdateOperationsInput | string | null;
    password?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    userRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    serverSession?: ServerSessionUncheckedUpdateManyWithoutUserNestedInput;
    userSettings?: UserSettingUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type ServerSessionCreateWithoutPanelsInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutServerSessionInput;
    serverInfo?: ServerInfoCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionUncheckedCreateWithoutPanelsInput = {
    id?: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverInfo?: ServerInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    Timeline?: TimelineUncheckedCreateNestedManyWithoutServerSessionInput;
  };

  export type ServerSessionCreateOrConnectWithoutPanelsInput = {
    where: ServerSessionWhereUniqueInput;
    create: Xor<
      ServerSessionCreateWithoutPanelsInput,
      ServerSessionUncheckedCreateWithoutPanelsInput
    >;
  };

  export type ServerSessionUpsertWithoutPanelsInput = {
    update: Xor<
      ServerSessionUpdateWithoutPanelsInput,
      ServerSessionUncheckedUpdateWithoutPanelsInput
    >;
    create: Xor<
      ServerSessionCreateWithoutPanelsInput,
      ServerSessionUncheckedCreateWithoutPanelsInput
    >;
    where?: ServerSessionWhereInput;
  };

  export type ServerSessionUpdateToOneWithWhereWithoutPanelsInput = {
    where?: ServerSessionWhereInput;
    data: Xor<
      ServerSessionUpdateWithoutPanelsInput,
      ServerSessionUncheckedUpdateWithoutPanelsInput
    >;
  };

  export type ServerSessionUpdateWithoutPanelsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateWithoutPanelsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverInfo?: ServerInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUncheckedUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionCreateWithoutTimelineInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: UserCreateNestedOneWithoutServerSessionInput;
    panels?: PanelCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoCreateNestedOneWithoutServerSessionInput;
  };

  export type ServerSessionUncheckedCreateWithoutTimelineInput = {
    id?: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    panels?: PanelUncheckedCreateNestedManyWithoutServerSessionInput;
    serverInfo?: ServerInfoUncheckedCreateNestedOneWithoutServerSessionInput;
    serverUserInfo?: UserInfoUncheckedCreateNestedOneWithoutServerSessionInput;
  };

  export type ServerSessionCreateOrConnectWithoutTimelineInput = {
    where: ServerSessionWhereUniqueInput;
    create: Xor<
      ServerSessionCreateWithoutTimelineInput,
      ServerSessionUncheckedCreateWithoutTimelineInput
    >;
  };

  export type ServerSessionUpsertWithoutTimelineInput = {
    update: Xor<
      ServerSessionUpdateWithoutTimelineInput,
      ServerSessionUncheckedUpdateWithoutTimelineInput
    >;
    create: Xor<
      ServerSessionCreateWithoutTimelineInput,
      ServerSessionUncheckedCreateWithoutTimelineInput
    >;
    where?: ServerSessionWhereInput;
  };

  export type ServerSessionUpdateToOneWithWhereWithoutTimelineInput = {
    where?: ServerSessionWhereInput;
    data: Xor<
      ServerSessionUpdateWithoutTimelineInput,
      ServerSessionUncheckedUpdateWithoutTimelineInput
    >;
  };

  export type ServerSessionUpdateWithoutTimelineInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutServerSessionNestedInput;
    panels?: PanelUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUpdateOneWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateWithoutTimelineInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    panels?: PanelUncheckedUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
  };

  export type ServerSessionCreateManyUserInput = {
    id?: string;
    origin: string;
    serverToken: string;
    serverType: $Enums.ServerType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserSettingCreateManyUserInput = {
    id?: string;
    key: string;
    value: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserInfoCreateManyUserInput = {
    id?: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    serverSEssionId: string;
  };

  export type ServerSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    panels?: PanelUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    panels?: PanelUncheckedUpdateManyWithoutServerSessionNestedInput;
    serverInfo?: ServerInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    serverUserInfo?: UserInfoUncheckedUpdateOneWithoutServerSessionNestedInput;
    Timeline?: TimelineUncheckedUpdateManyWithoutServerSessionNestedInput;
  };

  export type ServerSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    origin?: StringFieldUpdateOperationsInput | string;
    serverToken?: StringFieldUpdateOperationsInput | string;
    serverType?: EnumServerTypeFieldUpdateOperationsInput | $Enums.ServerType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserSettingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserInfoUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSession?: ServerSessionUpdateOneRequiredWithoutServerUserInfoNestedInput;
  };

  export type UserInfoUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSEssionId?: StringFieldUpdateOperationsInput | string;
  };

  export type UserInfoUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    avatarUrl?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    serverSEssionId?: StringFieldUpdateOperationsInput | string;
  };

  export type PanelCreateManyServerSessionInput = {
    id?: string;
    type: string;
  };

  export type TimelineCreateManyServerSessionInput = {
    id?: string;
    name: string;
    type: $Enums.TimelineType;
    listId?: string | null;
    channelId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PanelUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
  };

  export type PanelUncheckedUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
  };

  export type PanelUncheckedUpdateManyWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
  };

  export type TimelineUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TimelineUncheckedUpdateWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TimelineUncheckedUpdateManyWithoutServerSessionInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    type?: EnumTimelineTypeFieldUpdateOperationsInput | $Enums.TimelineType;
    listId?: NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };
}
