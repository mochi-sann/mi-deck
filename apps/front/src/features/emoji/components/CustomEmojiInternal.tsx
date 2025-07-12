import { useAtomValue } from "jotai";
import { Suspense } from "react";
import { emojiCacheAtom } from "@/lib/database/emoji-cache-database";
import { EmojiImg } from "./EmojiImg";
import { FetchEmoji } from "./FetchEmoji";

interface CustomEmojiInternalProps {
  name: string;
  host: string;
  emojis?: { [key: string]: string };
}

export function CustomEmojiInternal({
  name,
  host,
  emojis,
}: CustomEmojiInternalProps) {
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
