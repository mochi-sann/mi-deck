import type { Note } from "misskey-js/entities.js";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MisskeyNoteHeaderProps {
  user: Note["user"];
}

export const MisskeyNoteHeader = memo(({ user }: MisskeyNoteHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-10 w-10 bg-slate-900">
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
});

MisskeyNoteHeader.displayName = "MisskeyNoteHeader";
