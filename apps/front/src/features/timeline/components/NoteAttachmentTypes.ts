import type { Note } from "misskey-js/entities.js";

export type NoteFile = NonNullable<Note["files"]>[number];
