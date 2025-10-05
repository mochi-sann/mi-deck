import type { Note } from "misskey-js/entities.js";
import { memo, useMemo } from "react";
import { CustomEmojiCtx } from "@/features/emoji";
import { MfmText } from "@/features/mfm";
import { ReactionButton } from "@/features/reactions/components/ReactionButton";
import { cn } from "@/lib/utils";
import { NoteReactions } from "../../reactions/components/NoteReactions";
import { useNoteEmojis } from "../../reactions/hooks/useNoteEmojis";
import { MisskeyNoteHeader } from "./MisskeyNoteHeader";

interface MisskeyNoteContentProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
}

function MisskeyNoteContentBase({
  note,
  origin,
  emojis,
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
          <RenotePreview renote={note.renote} origin={origin} />
        ) : null}
        <NoteReactions
          note={note}
          origin={origin}
          emojis={note.reactionEmojis}
        />
        <div className="flex items-center gap-2 pt-1">
          <ReactionButton note={note} origin={origin} emojis={emojis} />
        </div>
      </div>
    </div>
  );
}

export const MisskeyNoteContent = memo(MisskeyNoteContentBase);

MisskeyNoteContent.displayName = "MisskeyNoteContent";

function RenotePreview({ renote, origin }: { renote: Note; origin: string }) {
  const host = origin || "";
  const { allEmojis } = useNoteEmojis(renote, origin);
  const contextValue = useMemo(
    () => ({
      host,
      emojis: allEmojis,
    }),
    [host, allEmojis],
  );

  return (
    <CustomEmojiCtx.Provider value={contextValue}>
      <div className="mt-2 rounded-md border bg-muted/40 p-3">
        <div className="flex items-start transition-colors duration-200 ">
          <MisskeyNoteHeader user={renote.user} />
          <MisskeyNoteContent
            note={renote}
            origin={origin}
            emojis={allEmojis}
          />
        </div>
      </div>
    </CustomEmojiCtx.Provider>
  );
}
