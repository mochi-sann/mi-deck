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
    return (
      <div className="mt-2 space-y-2">
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
      </div>
    );
  },
);

MisskeyNoteContent.displayName = "MisskeyNoteContent";
