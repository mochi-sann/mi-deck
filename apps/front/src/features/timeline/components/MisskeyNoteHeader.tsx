import type { Note } from "misskey-js/entities.js";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Text from "@/components/ui/text";
import { MfmText } from "@/features/mfm";

interface MisskeyNoteHeaderProps {
  user: Note["user"];
  origin: string;
  emojis: Record<string, string>;
}

export const MisskeyNoteHeader = memo(
  ({ user, origin, emojis }: MisskeyNoteHeaderProps) => {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 bg-slate-900">
          <AvatarImage src={user.avatarUrl} alt={user.name || user.username} />
          <AvatarFallback className="text-white">
            {(user.name || user.username)?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <MfmText
            text={user.name || user.username}
            host={origin}
            emojis={emojis}
          />
          <Text variant="p" className="text-muted-foreground text-sm">
            @{user.username}
          </Text>
        </div>
      </div>
    );
  },
);

MisskeyNoteHeader.displayName = "MisskeyNoteHeader";
