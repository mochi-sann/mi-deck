import clsx from "clsx";
import type { Note } from "misskey-js/entities.js";
import { isPureRenote } from "misskey-js/note.js";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MisskeyNoteHeaderProps {
  user: Note["user"];
  note: Note;
}

export const MisskeyNoteHeader = memo(
  ({ user, note }: MisskeyNoteHeaderProps) => {
    const isRenote = isPureRenote(note);
    return (
      <div className="flex items-center gap-2">
        <Avatar
          className={clsx("bg-slate-500", isRenote ? "size-5" : "size-10")}
        >
          <AvatarImage
            src={user.avatarUrl || undefined}
            alt={user.name || user.username}
          />
          <AvatarFallback className="text-white">
            {(user.name || user.username)?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  },
);

MisskeyNoteHeader.displayName = "MisskeyNoteHeader";
