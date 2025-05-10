import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  pgEnum,
  uniqueIndex,
  index,
  foreignKey,
  primaryKey,
  boolean, 
  integer, 
  jsonb,   
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2'; 

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);
export const serverTypeEnum = pgEnum('server_type', ['Misskey', 'OtherServer']);
export const timelineTypeEnum = pgEnum('timeline_type', [
  'HOME',
  'LOCAL',
  'GLOBAL',
  'LIST',
  'USER',
  'CHANNEL',
]);

// Tables
export const users = pgTable(
  'user', 
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()), 
    email: varchar('email', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 255 }),
    password: text('password').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()) 
      .notNull(),
    userRole: userRoleEnum('user_role').default('USER').notNull(),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex('user_email_key').on(table.email), 
    };
  },
);

export const userSettings = pgTable(
  'user_setting',
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }), 
    key: varchar('key', { length: 255 }).notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      userIdIndex: index('user_setting_user_id_idx').on(table.userId),
    };
  },
);

export const serverSessions = pgTable(
  'server_session',
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    origin: varchar('origin', { length: 255 }).notNull(),
    serverToken: text('server_token').notNull(),
    serverType: serverTypeEnum('server_type').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      userIdIndex: index('server_session_user_id_idx').on(table.userId),
      originUserIdUnique: uniqueIndex('server_session_origin_user_id_key').on(
        table.origin,
        table.userId,
      ),
    };
  },
);

export const serverInfos = pgTable(
  'server_info',
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),
    serverSessionId: varchar('server_session_id', { length: 255 })
      .unique()
      .notNull()
      .references(() => serverSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }), 
    name: varchar('name', { length: 255 }).notNull(),
    iconUrl: text('icon_url').notNull(),
    faviconUrl: text('favicon_url').notNull(),
    themeColor: varchar('theme_color', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      serverSessionIdIndex: index('server_info_server_session_id_idx').on(table.serverSessionId), 
    };
  },
);

export const userInfos = pgTable(
  'user_info',
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    avatarUrl: text('avater_url').notNull(), 
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    serverSessionId: varchar('server_s_ession_id', { length: 255 }) 
      .unique()
      .notNull()
      .references(() => serverSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }), 
  },
  (table) => {
    return {
      serverSessionIdIndex: index('user_info_server_s_ession_id_idx').on(table.serverSessionId), 
      userIdIndex: index('user_info_user_id_idx').on(table.userId),
    };
  },
);

export const panels = pgTable(
  'panel',
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),
    serverSessionId: varchar('server_session_id', { length: 255 })
      .notNull()
      .references(() => serverSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
  },
  (table) => {
    return {
      serverSessionIdIndex: index('panel_server_session_id_idx').on(table.serverSessionId),
    };
  },
);

export const timelines = pgTable(
  'timeline',
  {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),
    serverSessionId: varchar('server_session_id', { length: 255 })
      .notNull()
      .references(() => serverSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }), 
    name: varchar('name', { length: 255 }).notNull(),
    type: timelineTypeEnum('type').notNull(),
    listId: varchar('list_id', { length: 255 }), 
    channelId: varchar('channel_id', { length: 255 }), 
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      serverSessionIdIndex: index('timeline_server_session_id_idx').on(table.serverSessionId),
    };
  },
);

// Relations 
export const usersRelations = relations(users, ({ many, one }) => ({
  serverSessions: many(serverSessions),
  userSettings: many(userSettings),
  userInfos: many(userInfos), 
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const serverSessionsRelations = relations(serverSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [serverSessions.userId],
    references: [users.id],
  }),
  panels: many(panels),
  serverInfo: one(serverInfos, { 
    fields: [serverSessions.id],
    references: [serverInfos.serverSessionId],
  }),
  serverUserInfo: one(userInfos, { 
    fields: [serverSessions.id],
    references: [userInfos.serverSessionId],
  }),
  timelines: many(timelines),
}));

export const serverInfosRelations = relations(serverInfos, ({ one }) => ({
  serverSession: one(serverSessions, {
    fields: [serverInfos.serverSessionId],
    references: [serverSessions.id],
  }),
}));

export const userInfosRelations = relations(userInfos, ({ one }) => ({
  serverSession: one(serverSessions, {
    fields: [userInfos.serverSessionId],
    references: [serverSessions.id],
  }),
  user: one(users, { 
    fields: [userInfos.userId],
    references: [users.id],
  }),
}));

export const panelsRelations = relations(panels, ({ one }) => ({
  serverSession: one(serverSessions, {
    fields: [panels.serverSessionId],
    references: [serverSessions.id],
  }),
}));

export const timelinesRelations = relations(timelines, ({ one }) => ({
  serverSession: one(serverSessions, {
    fields: [timelines.serverSessionId],
    references: [serverSessions.id],
  }),
}));
