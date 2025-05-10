import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const serverType = pgEnum("ServerType", ["Misskey", "OtherServer"]);
export const timelineType = pgEnum("TimelineType", [
  "HOME",
  "LOCAL",
  "GLOBAL",
  "LIST",
  "USER",
  "CHANNEL",
]);
export const userRole = pgEnum("UserRole", ["ADMIN", "USER"]);

export const userSetting = pgTable(
  "user_setting",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("user_setting_user_id_idx").using("btree", table.userId),
    };
  },
);

export const serverSession = pgTable(
  "server_session",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    serverType: serverType("server_type").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    origin: text("origin").notNull(),
    serverToken: text("server_token").notNull(),
  },
  (table) => {
    return {
      originUserIdKey: uniqueIndex("server_session_origin_user_id_key").using(
        "btree",
        table.origin,
        table.userId,
      ),
      userIdIdx: index("server_session_user_id_idx").using(
        "btree",
        table.userId,
      ),
    };
  },
);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    email: text("email").notNull(),
    name: text("name"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    password: text("password").notNull(),
    userRole: userRole("user_role").default("USER").notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("user_email_key").using("btree", table.email),
    };
  },
);

export const serverInfo = pgTable(
  "server_info",
  {
    id: text("id").primaryKey().notNull(),
    serverSessionId: text("server_session_id")
      .notNull()
      .references(() => serverSession.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    faviconUrl: text("favicon_url").notNull(),
    iconUrl: text("icon_url").notNull(),
    name: text("name").notNull(),
    themeColor: text("theme_color").notNull(),
  },
  (table) => {
    return {
      serverSessionIdIdx: index("server_info_server_session_id_idx").using(
        "btree",
        table.serverSessionId,
      ),
      serverSessionIdKey: uniqueIndex(
        "server_info_server_session_id_key",
      ).using("btree", table.serverSessionId),
    };
  },
);

export const panel = pgTable(
  "panel",
  {
    id: text("id").primaryKey().notNull(),
    serverSessionId: text("server_session_id")
      .notNull()
      .references(() => serverSession.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    type: text("type").notNull(),
  },
  (table) => {
    return {
      serverSessionIdIdx: index("panel_server_session_id_idx").using(
        "btree",
        table.serverSessionId,
      ),
    };
  },
);

export const userInfo = pgTable(
  "user_info",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    // biome-ignore lint/style/useNamingConvention:
    serverSEssionId: text("server_s_ession_id")
      .notNull()
      .references(() => serverSession.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    userId: text("userId").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    username: text("username").notNull(),
    avaterUrl: text("avater_url").notNull(),
  },
  (table) => {
    return {
      // biome-ignore lint/style/useNamingConvention:
      serverSEssionIdIdx: index("user_info_server_s_ession_id_idx").using(
        "btree",
        table.serverSEssionId,
      ),
      // biome-ignore lint/style/useNamingConvention:
      serverSEssionIdKey: uniqueIndex("user_info_server_s_ession_id_key").using(
        "btree",
        table.serverSEssionId,
      ),
    };
  },
);

export const timeline = pgTable(
  "timeline",
  {
    id: text("id").primaryKey().notNull(),
    serverSessionId: text("server_session_id")
      .notNull()
      .references(() => serverSession.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    type: time("type").notNull(),
    listId: text("list_id"),
    channelId: text("channel_id"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      serverSessionIdIdx: index("timeline_server_session_id_idx").using(
        "btree",
        table.serverSessionId,
      ),
    };
  },
);
