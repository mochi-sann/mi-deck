import { relations } from "drizzle-orm/relations";
import {
  panel,
  serverInfo,
  serverSession,
  timeline,
  user,
  userInfo,
  userSetting,
} from "./schema";

export const userSettingRelations = relations(userSetting, ({ one }) => ({
  user: one(user, {
    fields: [userSetting.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  userSettings: many(userSetting),
  serverSessions: many(serverSession),
  userInfos: many(userInfo),
}));

export const serverSessionRelations = relations(
  serverSession,
  ({ one, many }) => ({
    user: one(user, {
      fields: [serverSession.userId],
      references: [user.id],
    }),
    serverInfos: many(serverInfo),
    panels: many(panel),
    userInfos: many(userInfo),
    timelines: many(timeline),
  }),
);

export const serverInfoRelations = relations(serverInfo, ({ one }) => ({
  serverSession: one(serverSession, {
    fields: [serverInfo.serverSessionId],
    references: [serverSession.id],
  }),
}));

export const panelRelations = relations(panel, ({ one }) => ({
  serverSession: one(serverSession, {
    fields: [panel.serverSessionId],
    references: [serverSession.id],
  }),
}));

export const userInfoRelations = relations(userInfo, ({ one }) => ({
  serverSession: one(serverSession, {
    fields: [userInfo.serverSEssionId],
    references: [serverSession.id],
  }),
  user: one(user, {
    fields: [userInfo.userId],
    references: [user.id],
  }),
}));

export const timelineRelations = relations(timeline, ({ one }) => ({
  serverSession: one(serverSession, {
    fields: [timeline.serverSessionId],
    references: [serverSession.id],
  }),
}));
