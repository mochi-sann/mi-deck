import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ServerType, TimelineType, UserRole } from "./enums";

export type Panel = {
  id: string;
  server_session_id: string;
  type: string;
};
export type ServerInfo = {
  id: string;
  server_session_id: string;
  name: string;
  icon_url: string;
  favicon_url: string;
  theme_color: string;
  created_at: Generated<Timestamp>;
  updated_at: Timestamp;
};
export type ServerSession = {
  id: string;
  user_id: string;
  origin: string;
  server_token: string;
  server_type: ServerType;
  created_at: Generated<Timestamp>;
  updated_at: Timestamp;
};
export type Timeline = {
  id: string;
  server_session_id: string;
  name: string;
  type: TimelineType;
  list_id: string | null;
  channel_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Timestamp;
};
export type User = {
  id: string;
  email: string;
  name: string | null;
  password: string;
  created_at: Generated<Timestamp>;
  updated_at: Timestamp;
  user_role: Generated<UserRole>;
};
export type UserInfo = {
  id: string;
  name: string;
  username: string;
  avater_url: string;
  created_at: Generated<Timestamp>;
  updated_at: Timestamp;
  server_s_ession_id: string;
  userId: string | null;
};
export type UserSetting = {
  id: string;
  user_id: string;
  key: string;
  value: string;
  created_at: Generated<Timestamp>;
  updated_at: Timestamp;
};
export type DB = {
  panel: Panel;
  server_info: ServerInfo;
  server_session: ServerSession;
  timeline: Timeline;
  user: User;
  user_info: UserInfo;
  user_setting: UserSetting;
};
