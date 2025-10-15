import type { Note } from "misskey-js/entities.js";
import { memo, useMemo } from "react";
import { CustomEmojiCtx } from "@/features/emoji";
import { MfmText } from "@/features/mfm";
import { NoteReplySection } from "@/features/notes/components/NoteReplySection";
import { ReactionButton } from "@/features/reactions/components/ReactionButton";
import { cn } from "@/lib/utils";
import { NoteReactions } from "../../reactions/components/NoteReactions";
import { useNoteEmojis } from "../../reactions/hooks/useNoteEmojis";
import { MisskeyNoteHeader } from "./MisskeyNoteHeader";

interface MisskeyNoteContentProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
  depth?: number;
}

const MAX_RENOTE_PREVIEW_DEPTH = 1;

const resolveNoteUrl = (note: Note, origin: string): string => {
  if (note.url) return note.url;
  if (note.uri) return note.uri;

  const hasProtocol = /^https?:\/\//.test(origin);
  const normalizedOrigin = origin
    ? (hasProtocol ? origin : `https://${origin}`).replace(/\/$/, "")
    : "";

  if (!normalizedOrigin) {
    return `/notes/${note.id}`;
  }

  return `${normalizedOrigin}/notes/${note.id}`;
};

function MisskeyNoteContentBase({
  note,
  origin,
  emojis,
  depth = 0,
}: MisskeyNoteContentProps) {
  const user = note.user;
  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <p>
            <MfmText
              text={user.name || user.username}
              host={origin}
              emojis={emojis}
            />
            <span className="text-muted-foreground">@{user.username}</span>
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {note.text && (
          <MfmText text={note.text} host={origin} emojis={emojis} />
        )}
        {note.files && note.files.length > 0 && (
          <div className="space-y-2">
            {note.files.map((file) => (
              <img
                key={file.id}
                src={file.url}
                alt="Note Attachment"
                className={cn("mt-2 h-auto max-w-full rounded-md border")}
              />
            ))}
          </div>
        )}
        {note.renote ? (
          <RenotePreview
            renote={note.renote}
            origin={origin}
            depth={depth + 1}
          />
        ) : null}
        <NoteReactions
          note={note}
          origin={origin}
          emojis={note.reactionEmojis}
        />
        <div className="flex items-center gap-2 pt-1">
          <ReactionButton note={note} origin={origin} emojis={emojis} />
          <NoteReplySection note={note} origin={origin} />
        </div>
      </div>
    </div>
  );
}

export const MisskeyNoteContent = memo(MisskeyNoteContentBase);

MisskeyNoteContent.displayName = "MisskeyNoteContent";

function RenotePreview({
  renote,
  origin,
  depth,
}: {
  renote: Note;
  origin: string;
  depth: number;
}) {
  const host = origin || "";
  const { allEmojis } = useNoteEmojis(renote, origin);
  const contextValue = useMemo(
    () => ({
      host,
      emojis: allEmojis,
    }),
    [host, allEmojis],
  );

  if (depth > MAX_RENOTE_PREVIEW_DEPTH) {
    const noteUrl = resolveNoteUrl(renote, origin);
    const username = renote.user.username;

    return (
      <div className="mt-2 rounded-md border bg-muted/40 p-3 text-sm">
        <a
          href={noteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          @{username}のノートを見る
        </a>
      </div>
    );
  }

  return (
    <CustomEmojiCtx.Provider value={contextValue}>
      <div className="mt-2 rounded-md border bg-muted/40 p-3">
        <div className="flex items-start gap-2">
          <MisskeyNoteHeader user={renote.user} />
          <MisskeyNoteContent
            note={renote}
            origin={origin}
            emojis={allEmojis}
            depth={depth}
          />
        </div>
      </div>
    </CustomEmojiCtx.Provider>
  );
}
