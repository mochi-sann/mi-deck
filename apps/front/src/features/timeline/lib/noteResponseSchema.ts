import {
  array,
  boolean,
  type InferOutput,
  lazy,
  nullable,
  objectWithRest,
  optional,
  record,
  safeParse,
  string,
  unknown,
} from "valibot";

const NoteUserSchema = objectWithRest(
  {
    id: string(),
    username: string(),
    name: optional(nullable(string())),
    host: optional(nullable(string())),
    avatarUrl: optional(nullable(string())),
    emojis: optional(record(string(), string())),
    isCat: optional(boolean()),
  },
  unknown(),
);

const NoteFileSchema = objectWithRest(
  {
    id: string(),
    url: string(),
    name: optional(nullable(string())),
    isSensitive: optional(boolean()),
  },
  unknown(),
);

const createNoteSchema: () => ReturnType<typeof objectWithRest> = () =>
  objectWithRest(
    {
      id: string(),
      text: optional(nullable(string())),
      cw: optional(nullable(string())),
      user: NoteUserSchema,
      files: optional(array(NoteFileSchema)),
      reactionEmojis: optional(record(string(), string())),
      url: optional(string()),
      uri: optional(string()),
      renote: optional(nullable(lazy(createNoteSchema))),
    },
    unknown(),
  );

const NoteSchema = lazy(createNoteSchema);

const NotesResponseSchema = array(NoteSchema);

export type NotesResponseOutput = InferOutput<typeof NotesResponseSchema>;

export const parseNotesResponse = (input: unknown) =>
  safeParse(NotesResponseSchema, input);
