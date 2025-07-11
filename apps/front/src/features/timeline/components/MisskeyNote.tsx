import { atom, useAtom, useAtomValue } from "jotai";
import type { Note } from "misskey-js/entities.js";
import { createContext, Fragment, memo, Suspense, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Text from "@/components/ui/text";
import { MfmText } from "@/features/mfm";
import {
  emojiCacheAtom,
  updateEmojiCacheAtom,
} from "@/lib/database/emoji-cache-database";
import { cn } from "@/lib/utils"; // Import cn utility

// Emoji fetching utilities
const toUrl = (host: string) => {
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }
  return `https://${host}`;
};

// Fetch state management
const emojiFetchAtom = atom<{ [id: string]: Promise<string | null> }>({});

// Simple foreign API hook for emoji fetching
function useForeignApi(host: string) {
  if (!host) return null;

  return {
    emojiUrl: async (name: string): Promise<string | null> => {
      try {
        const response = await fetch(`${toUrl(host)}/api/emoji?name=${name}`);
        const data = await response.json();
        return data.url || null;
      } catch (error) {
        console.warn("Failed to fetch emoji:", error);
        return null;
      }
    },
  };
}

// Context for emoji data
export const CustomEmojiCtx = createContext<{
  host: string | null;
  emojis?: { [key: string]: string } | undefined;
}>({
  host: null,
});

// Emoji image component
const EmojiImg = ({ name, url }: { name: string; url?: string | null }) =>
  !url ? (
    `:${name}:`
  ) : (
    <img
      src={url}
      alt={name}
      className="mfm-customEmoji inline h-[1.2em] w-auto"
    />
  );

// Fetching emoji component
function FetchEmoji({ name, host }: { name: string; host: string }) {
  const api = useForeignApi(host);
  const cache = useAtomValue(emojiCacheAtom);
  const [, updateCache] = useAtom(updateEmojiCacheAtom);
  const [fetches, setFetches] = useAtom(emojiFetchAtom);

  const key = name + "@" + host;

  const Cached = () => <EmojiImg name={name} url={cache[host]?.[name]} />;
  if (host in cache && name in cache[host]) return <Cached />;
  if (!api) return <Cached />;

  if (key in fetches) {
    const url = use(fetches[key]);
    updateCache({ host, cache: { [name]: url } });
    const newFetches = { ...fetches };
    delete newFetches[key];
    setFetches(newFetches);
    return <EmojiImg name={name} url={url} />;
  }

  const task = api.emojiUrl(name);
  setFetches({ ...fetches, [key]: task });
  return <EmojiImg name={name} url={use(task)} />;
}

// Internal custom emoji component
function CustomEmojiInternal({
  name,
  host,
  emojis,
}: {
  name: string;
  host: string;
  emojis?: { [key: string]: string };
}) {
  const cache = useAtomValue(emojiCacheAtom);

  // First check local emoji data
  const localEmojiUrl = emojis?.[name];

  if (localEmojiUrl) {
    return <EmojiImg name={name} url={localEmojiUrl} />;
  }

  if (!host) return <EmojiImg name={name} />;
  return (
    <Suspense fallback={<EmojiImg name={name} url={cache[host]?.[name]} />}>
      <FetchEmoji name={name} host={host} />
    </Suspense>
  );
}

// Component to display a single Misskey note with a Twitter-like design
function MisskeyNoteBase({ note, origin }: { note: Note; origin: string }) {
  const user = note.user;
  const host = origin || "";

  // Combine note emojis and user emojis
  const allEmojis = { ...note.emojis, ...note.user.emojis };

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
                emojis={note.emojis}
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

// Main CustomEmoji component with fallback support
export function CustomEmoji({
  name,
  host,
  emojis,
}: {
  name: string;
  host?: string;
  emojis?: { [key: string]: string };
}) {
  if (host || emojis) {
    return (
      <CustomEmojiCtx.Provider
        value={{
          host: host || null,
          emojis: emojis,
        }}
      >
        <CustomEmojiInternal name={name} host={host || ""} emojis={emojis} />
      </CustomEmojiCtx.Provider>
    );
  }

  return <CustomEmojiInternal name={name} host="" emojis={emojis} />;
}

// String processing component for emojis
export const CustomEmojiStr = ({
  text,
  host,
  emojis,
}: {
  text: string;
  host?: string;
  emojis?: { [key: string]: string };
}) =>
  text.split(":").map((s, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <CustomEmoji name={s} host={host} emojis={emojis} key={i} />
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <Fragment key={i}>{s}</Fragment>
    ),
  );

const MisskeyNote = memo(MisskeyNoteBase);
export { MisskeyNote };
