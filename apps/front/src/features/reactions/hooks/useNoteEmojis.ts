import type { Note } from "misskey-js/entities.js";
import { useEffect, useMemo, useState } from "react";
import { useCustomEmojis } from "@/hooks/useCustomEmojis";
import { createProxiedEmojis } from "@/lib/utils/emoji-proxy";
import type { EmojiResult } from "@/types/emoji";
import { GetReactionsWithCounts } from "../../hooks/useNoteReactions";

/**
 * ノートとユーザーの絵文字を統合して管理するフック
 */
export function useNoteEmojis(note: Note, origin: string) {
  const user = note.user;
  const host = origin || "";
  const { fetchEmojis } = useCustomEmojis(host);
  const [customEmojis, setCustomEmojis] = useState<EmojiResult>({});

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
      const matches = text.match(/:([a-zA-Z0-9_]+):/g);
      return matches
        ? matches.map((match) => match.slice(1, -1)).filter(Boolean)
        : [];
    };

    const reactionsEmojirs = GetReactionsWithCounts(note).map(
      (value) => value.reaction.match(/:([^@]+)@/) || ["", ""],
    );
    const textsToCheck = [
      note.text || "",
      user.name || "",
      user.username || "",
      `:${reactionsEmojirs.map((value) => value[1]).join("::")}:` || "",
    ];
    console.log(
      ...[textsToCheck, "👀 [useNoteEmojis.ts:57]: textsToCheck"].reverse(),
    );
    console.log(
      ...[
        reactionsEmojirs,
        "👀 [useNoteEmojis.ts:60]: reactionsEmojirs",
      ].reverse(),
    );

    const allEmojiNames = new Set<string>();
    for (const text of textsToCheck) {
      extractCustomEmojiNames(text).forEach((name) => allEmojiNames.add(name));
    }

    return Array.from(allEmojiNames);
  }, [note.text, user.name, user.username, note]);

  // Fetch emojis when emoji names change
  useEffect(() => {
    if (extractedEmojiNames.length > 0) {
      fetchEmojis(extractedEmojiNames)
        .then(setCustomEmojis)
        .catch((error) => {
          console.error("Failed to fetch emojis:", error);
          // Set empty object on error to avoid infinite loading state
          setCustomEmojis({});
        });
    }
  }, [extractedEmojiNames, fetchEmojis]);

  return {
    allEmojis,
    proxiedEmojis,
    validCustomEmojis,
    customEmojis,
  };
}
