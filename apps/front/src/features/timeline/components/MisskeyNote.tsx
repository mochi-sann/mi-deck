import type { Note } from "misskey-js/entities.js";
import { memo, useEffect, useMemo, useState } from "react";
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

  // Memoize combined emojis and proxy URLs to prevent unnecessary recalculation
  const proxiedEmojis = useMemo(() => {
    const combinedEmojis = { ...note.emojis, ...note.user.emojis };
    return createProxiedEmojis(combinedEmojis, host);
  }, [note.emojis, note.user.emojis, host]);

  // Memoize filtered custom emojis
  const validCustomEmojis = useMemo(() => {
    return Object.fromEntries(
      Object.entries(customEmojis).filter(([, url]) => url !== null),
    ) as Record<string, string>;
  }, [customEmojis]);

  // Memoize final emoji object
  const allEmojis = useMemo(
    () => ({
      ...proxiedEmojis,
      ...validCustomEmojis,
    }),
    [proxiedEmojis, validCustomEmojis],
  );

  // Extract custom emoji names from MFM text and memoize
  const extractedEmojiNames = useMemo(() => {
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

    return Array.from(allEmojiNames);
  }, [note.text, user.name, user.username]);

  // Fetch emojis when emoji names change
  useEffect(() => {
    if (extractedEmojiNames.length > 0) {
      fetchEmojis(extractedEmojiNames).then(setCustomEmojis);
    }
  }, [extractedEmojiNames, fetchEmojis]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      host,
      emojis: allEmojis,
    }),
    [host, allEmojis],
  );

  return (
    <CustomEmojiCtx.Provider value={contextValue}>
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

const MisskeyNote = memo(MisskeyNoteBase, (prevProps, nextProps) => {
  // Deep comparison for emojis objects since they can be recreated with same content
  const emojisEqual = (
    prev: Record<string, string>,
    next: Record<string, string>,
  ) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    if (prevKeys.length !== nextKeys.length) return false;

    return prevKeys.every((key) => prev[key] === next[key]);
  };

  // Only re-render if note or origin actually changed
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.text === nextProps.note.text &&
    emojisEqual(prevProps.note.emojis || {}, nextProps.note.emojis || {}) &&
    emojisEqual(
      prevProps.note.user.emojis || {},
      nextProps.note.user.emojis || {},
    ) &&
    prevProps.note.user.name === nextProps.note.user.name &&
    prevProps.note.user.username === nextProps.note.user.username &&
    prevProps.note.user.avatarUrl === nextProps.note.user.avatarUrl &&
    prevProps.origin === nextProps.origin
  );
});

export { MisskeyNote };
