import type { Note } from "misskey-js/entities.js";
import { useMemo } from "react";
import { useNoteEmojis } from "@/features/reactions/hooks/useNoteEmojis";

type MisskeyNoteEmojiContext = {
  host: string;
  emojis: Record<string, string>;
};

/**
 * Misskeyノートに紐づくカスタム絵文字情報をまとめて取得するカスタムフック
 * - Misskey API固有のホスト判定
 * - ノート／ユーザー由来の絵文字統合
 * - CustomEmojiCtx.Providerへ渡す値のメモ化
 */
export function useMisskeyNoteEmojis(note: Note, origin: string) {
  const host = origin || "";
  const { allEmojis } = useNoteEmojis(note, origin);

  const contextValue: MisskeyNoteEmojiContext = useMemo(
    () => ({
      host,
      emojis: allEmojis,
    }),
    [host, allEmojis],
  );

  return {
    host,
    emojis: allEmojis,
    contextValue,
  };
}
