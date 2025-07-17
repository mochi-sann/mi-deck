export interface MisskeyServerConnection {
  id: string;
  origin: string;
  accessToken?: string;
  isActive: boolean;
  userInfo?: {
    id: string;
    username: string;
    name?: string;
    avatarUrl?: string;
  };
  serverInfo?: {
    name: string;
    version: string;
    description?: string;
    iconUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineConfig {
  id: string;
  name: string;
  serverId: string;
  type: "home" | "local" | "social" | "global" | "list" | "channel";
  order: number;
  isVisible: boolean;
  settings?: {
    withReplies?: boolean;
    withFiles?: boolean;
    excludeNsfw?: boolean;
    listId?: string;
    channelId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type Theme = "light" | "dark" | "system";

export interface AppSettings {
  theme: Theme;
  language: string;
  lastUpdated: Date;
}

export interface ClientAuthState {
  currentServerId?: string;
  servers: MisskeyServerConnection[];
  timelines: TimelineConfig[];
  lastUpdated: Date;
}
