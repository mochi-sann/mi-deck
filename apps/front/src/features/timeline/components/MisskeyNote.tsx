import type { Note } from "misskey-js/entities.js";
import { memo, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Text from "@/components/ui/text";
import { CustomEmojiCtx } from "@/features/emoji";
import { MfmText } from "@/features/mfm";
import { useCustomEmojis } from "@/hooks/useCustomEmojis";
import { cn } from "@/lib/utils";
import { createProxiedEmojis } from "@/lib/utils/emoji-proxy";

// Component to display a single Misskey note with a Twitter-like design
function MisskeyNoteBase({ note, origin }: { note: Note; origin: string }) {
  const user = note.user;
  const host = origin || "";
  const { fetchEmojis } = useCustomEmojis(host);
  const [customEmojis, setCustomEmojis] = useState<
    Record<string, string | null>
  >({});

  // Combine note emojis and user emojis, then convert to proxy URLs
  const combinedEmojis = { ...note.emojis, ...note.user.emojis };
  const proxiedEmojis = createProxiedEmojis(combinedEmojis, host);

  // Filter out null values from customEmojis
  const validCustomEmojis = Object.fromEntries(
    Object.entries(customEmojis).filter(([, url]) => url !== null),
  ) as Record<string, string>;

  const allEmojis = {
    ...proxiedEmojis,
    ...validCustomEmojis,
  };

  // Extract custom emoji names from MFM text
  useEffect(() => {
    const extractCustomEmojiNames = (text: string): string[] => {
      const emojiPattern = /:([a-zA-Z0-9_]+):/g;
      const matches = text.match(emojiPattern);
      return matches ? matches.map((match) => match.slice(1, -1)) : [];
    };

    const textsToCheck = [
      note.text || "",
      user.name || "",
      user.username || "",
    ].filter(Boolean);

    const allEmojiNames = new Set<string>();
    for (const text of textsToCheck) {
      extractCustomEmojiNames(text).forEach((name) => allEmojiNames.add(name));
    }

    const emojiNames = Array.from(allEmojiNames);
    if (emojiNames.length > 0) {
      fetchEmojis(emojiNames).then(setCustomEmojis);
    }
  }, [note.text, user.name, user.username, fetchEmojis]);

  return (
    <CustomEmojiCtx.Provider
      value={{
        host,
        emojis: allEmojis,
      }}
    >
      <article
        key={note.id}
        className={cn(
          "flex gap-3 border-b p-3 hover:bg-muted/50", // Translated styles
        )}
      >
        {/* Avatar Column */}
        <div className="shrink-0">
          <Avatar className="h-10 w-10 bg-slate-900">
            <AvatarImage src={note.user.avatarUrl || ""} />
            <AvatarFallback className="bg-slate-800">
              <MfmText
                text={note.user.username || user.username}
                host={host}
                emojis={allEmojis}
              />
            </AvatarFallback>{" "}
            {/* Fallback with username */}
          </Avatar>
        </div>

        {/* Content Column */}
        <div className="flex min-w-0 grow flex-col">
          {/* Header: User Info */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Text className="font-semibold">
              {/* Added font-semibold for name */}
              <MfmText
                text={user.name || user.username}
                host={host}
                emojis={allEmojis}
              />
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
            <div>
              {/* Added whitespace and break-words */}
              {note.text && (
                <MfmText text={note.text} host={host} emojis={allEmojis} />
              )}
              {/* Style italic text */}
            </div>
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
    </CustomEmojiCtx.Provider>
  );
}

const MisskeyNote = memo(MisskeyNoteBase);
export { MisskeyNote };
