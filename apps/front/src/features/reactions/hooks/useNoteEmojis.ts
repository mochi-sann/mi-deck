import type { Note } from "misskey-js/entities.js";
import { useEffect, useMemo, useState } from "react";
import { useCustomEmojis } from "@/hooks/useCustomEmojis";
import { createProxiedEmojis } from "@/lib/utils/emoji-proxy";
import type { EmojiResult } from "@/types/emoji";
import { GetReactionsWithCounts } from "./useNoteReactions";
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
    const combinedEmojis = {
      ...note.emojis,
      ...note.user.emojis,
      ...note.reactionEmojis,
    };
    return createProxiedEmojis(combinedEmojis, host);
  }, [note.emojis, note.user.emojis, host, note.reactionEmojis]);

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

    // Extract custom emoji names from reactions, strictly handling local vs remote
    // Remote reactions (containing '@') are IGNORED for fetching purposes as the server won't have them
    // EXCEPTION: reactions ending in '@.:' are considered local aliases (e.g. :name@.:)
    const reactions = GetReactionsWithCounts(note);
    const localReactionNames = reactions
      .map((r) => r.reaction)
      .filter((r) => {
        // Must start and end with :
        if (!r.startsWith(":") || !r.endsWith(":")) return false;

        // If it doesn't contain @, it's a standard local emoji (:name:)
        if (!r.includes("@")) return true;

        // If it contains @, only allow if it marks a local alias (@.:)
        return r.endsWith("@.:");
      })
      .map((r) => {
        //If it's a local alias like :name@.:, extract 'name'
        if (r.endsWith("@.:")) {
          return r.slice(1, -3); // Start after first :, end before @.:
        }
        // Otherwise standard :name:
        return r.slice(1, -1);
      });

    const textsToCheck = [
      note.text || "",
      user.name || "",
      user.username || "",
      // Join local reaction names to be detected by extractCustomEmojiNames
      `:${localReactionNames.join("::")}:`,
    ];

    const allEmojiNames = new Set<string>();
    for (const text of textsToCheck) {
      extractCustomEmojiNames(text).forEach((name) => {
        allEmojiNames.add(name);
      });
    }

    return Array.from(allEmojiNames);
  }, [note.text, user.name, user.username, note]);

  // Fetch emojis when emoji names change
  useEffect(() => {
    // Filter out emojis that are already known, checking both exact match and lowercase match
    const missingEmojiNames = extractedEmojiNames.filter(
      (name) => !proxiedEmojis[name] && !proxiedEmojis[name.toLowerCase()],
    );

    if (missingEmojiNames.length > 0) {
      fetchEmojis(missingEmojiNames)
        .then(setCustomEmojis)
        .catch((error) => {
          console.error("Failed to fetch emojis:", error);
          // Set empty object on error to avoid infinite loading state
          setCustomEmojis({});
        });
    }
  }, [extractedEmojiNames, fetchEmojis, proxiedEmojis]);

  return {
    allEmojis,
    proxiedEmojis,
    validCustomEmojis,
    customEmojis,
  };
}
