import { cn } from "@/lib/utils"; // Import cn utility
import { Note } from "misskey-js/entities.js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Text from "../ui/text";

// Component to display a single Misskey note with a Twitter-like design
export function MisskeyNote({ note }: { note: Note }) {
  const user = note.user;

  return (
    <article
      key={note.id}
      className={cn(
        "flex gap-3 border-b p-3 hover:bg-muted/50", // Translated styles
      )}
    >
      {/* Avatar Column */}
      <div className="shrink-0">
        <Avatar>
          <AvatarImage src={note.user.avatarUrl || ""} />
          <AvatarFallback>{note.user.name || user.username}</AvatarFallback>{" "}
          {/* Fallback with username */}
        </Avatar>
      </div>

      {/* Content Column */}
      <div className="flex min-w-0 grow flex-col">
        {/* Header: User Info */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Text className="font-semibold">
            {" "}
            {/* Added font-semibold for name */}
            {user.name || user.username}{" "}
            {/* Display name or username if name is missing */}
          </Text>
          <Text className="text-muted-foreground">@{user.username}</Text>{" "}
          {/* Use muted-foreground */}
          {/* Optional: Timestamp - requires date formatting */}
          {/* <Text className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(note.createdAt))}</Text> */}
        </div>

        {/* Body: Note Text */}
        <div className="mt-1">
          {/* Use whitespace pre-wrap to preserve line breaks */}
          {/* Assuming Text component handles text display or replace with <p> */}
          <Text className="whitespace-pre-wrap break-words">
            {" "}
            {/* Added whitespace and break-words */}
            {note.text || <i className="text-muted-foreground">(No Text)</i>}{" "}
            {/* Style italic text */}
          </Text>
        </div>
        {/* Image attachments */}
        <div className="mt-2">
          {" "}
          {/* Added margin-top for images */}
          {note.files?.map((file) => (
            <img
              key={file.id}
              src={file.url}
              alt="Note Attachment"
              className="mt-2 h-auto max-w-full rounded-md border" // Added Tailwind classes for styling
            />
          ))}
        </div>

        {/* Optional: Actions (Reply, Renote, Like) - Add later if needed */}
        {/* <div className="mt-2 flex gap-4"> ... </div> */}
      </div>
    </article>
  );
}
