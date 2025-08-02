import type { Note } from "misskey-js/entities.js";
import { memo } from "react";
import { MfmText } from "@/features/mfm";
import { cn } from "@/lib/utils";

interface MisskeyNoteContentProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
}

export const MisskeyNoteContent = memo(
  ({ note, origin, emojis }: MisskeyNoteContentProps) => {
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
            <div className="overflow-wrap-anywhere break-words break-all">
              <MfmText text={note.text} host={origin} emojis={emojis} />
            </div>
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
        </div>
      </div>
    );
  },
);

MisskeyNoteContent.displayName = "MisskeyNoteContent";
