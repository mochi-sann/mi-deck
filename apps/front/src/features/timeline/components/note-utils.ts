import type { Note } from "misskey-js/entities.js";
import { normalizeOrigin } from "@/lib/utils";

export const resolveNoteUrl = (
  note: Partial<Note> & { id: string },
  origin: string,
): string => {
  if ("url" in note && note.url) return note.url as string;
  if ("uri" in note && note.uri) return note.uri as string;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return `/notes/${note.id}`;
  }

  return `${normalizedOrigin}/notes/${note.id}`;
};

export const resolveUserUrl = (
  user: Note["user"],
  origin: string,
): string => {
  if (user.url) return user.url;

  const normalizedOrigin = normalizeOrigin(origin);
  const username = user.username ?? user.name ?? user.id;
  const hostSuffix = user.host ? `@${user.host}` : "";

  if (!normalizedOrigin) {
    return `/@${username}${hostSuffix}`;
  }

  return `${normalizedOrigin}/@${username}${hostSuffix}`;
};
