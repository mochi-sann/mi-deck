import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { UserRole, ServerType, TimelineType } from "./enums";

export type Panel = {
    id: string;
    serverSessionId: string;
    type: string;
};
export type ServerInfo = {
    id: string;
    serverSessionId: string;
    name: string;
    iconUrl: string;
    faviconUrl: string;
    themeColor: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type ServerSession = {
    id: string;
    userId: string;
    origin: string;
    serverToken: string;
    serverType: ServerType;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Timeline = {
    id: string;
    serverSessionId: string;
    name: string;
    type: TimelineType;
    listId: string | null;
    channelId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type User = {
    id: string;
    email: string;
    name: string | null;
    password: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    userRole: Generated<UserRole>;
};
export type UserInfo = {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    serverSEssionId: string;
    userId: string | null;
};
export type UserSetting = {
    id: string;
    userId: string;
    key: string;
    value: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type DB = {
    Panel: Panel;
    ServerInfo: ServerInfo;
    ServerSession: ServerSession;
    Timeline: Timeline;
    User: User;
    UserInfo: UserInfo;
    UserSetting: UserSetting;
};
