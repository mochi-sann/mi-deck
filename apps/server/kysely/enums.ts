export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const ServerType = {
    Misskey: "Misskey",
    OtherServer: "OtherServer"
} as const;
export type ServerType = (typeof ServerType)[keyof typeof ServerType];
export const TimelineType = {
    HOME: "HOME",
    LOCAL: "LOCAL",
    GLOBAL: "GLOBAL",
    LIST: "LIST",
    USER: "USER",
    CHANNEL: "CHANNEL"
} as const;
export type TimelineType = (typeof TimelineType)[keyof typeof TimelineType];
