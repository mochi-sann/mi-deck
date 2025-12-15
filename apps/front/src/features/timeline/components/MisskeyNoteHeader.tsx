import clsx from "clsx";
import type { Note } from "misskey-js/entities.js";
import { isPureRenote } from "misskey-js/note.js";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStorage } from "@/lib/storage/context";

interface MisskeyNoteHeaderProps {
  user: Note["user"];
  note: Note;
  origin: string;
}

export const MisskeyNoteHeader = memo(
  ({ user, note, origin }: MisskeyNoteHeaderProps) => {
    const isRenote = isPureRenote(note);
    const { servers, addTimeline } = useStorage();

    const handleUserClick = (e: React.MouseEvent) => {
      e.preventDefault();
      const server = servers.find((s) => s.origin === origin);
      if (server) {
        addTimeline({
          name: user.name || user.username,
          serverId: server.id,
          type: "user",
          order: Date.now(),
          isVisible: true,
          settings: {
            userId: user.id,
          },
        });
      } else {
        console.error("Server not found for origin:", origin);
      }
    };

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUserClick}
          className="hover:opacity-80 transition-opacity appearance-none bg-transparent border-0 p-0 cursor-pointer"
        >
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
        </button>
      </div>
    );
  },
);

MisskeyNoteHeader.displayName = "MisskeyNoteHeader";
