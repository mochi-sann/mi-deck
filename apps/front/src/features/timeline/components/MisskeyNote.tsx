import { Repeat2 } from "lucide-react";
import type { Note } from "misskey-js/entities.js";
import { memo, useMemo } from "react";
import { CustomEmojiCtx } from "@/features/emoji";
import { useNoteEmojis } from "@/features/reactions/hooks/useNoteEmojis";
import { cn } from "@/lib/utils";
import { MisskeyNoteContent } from "./MisskeyNoteContent";
import { MisskeyNoteHeader } from "./MisskeyNoteHeader";

// Component to display a single Misskey note with a Twitter-like design
function MisskeyNoteBase({ note, origin }: { note: Note; origin: string }) {
  const host = origin || "";
  const { allEmojis } = useNoteEmojis(note, origin);

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
        className={cn(
          "flex items-start gap-3 border-b p-3 transition-colors duration-200 hover:bg-muted/50",
        )}
      >
        <div>
          <MisskeyNoteHeader user={note.user} />
        </div>
        <div className="min-w-0 flex-1">
          {note.renote && (
            <div className="mb-1 flex items-center gap-1 text-muted-foreground text-xs">
              <Repeat2 className="h-3.5 w-3.5" aria-hidden />
              <span>Renote</span>
            </div>
          )}
          <MisskeyNoteContent note={note} origin={origin} emojis={allEmojis} />
        </div>
      </article>
    </CustomEmojiCtx.Provider>
  );
}

/**
 * 絵文字オブジェクトの深い比較を行う関数
 * オブジェクトが同じ内容で再作成される場合を考慮
 */
const areEmojisEqual = (
  prev: Record<string, string>,
  next: Record<string, string>,
): boolean => {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  if (prevKeys.length !== nextKeys.length) return false;

  return prevKeys.every((key) => prev[key] === next[key]);
};

/**
 * MisskeyNoteの比較関数
 * 不要な再レンダリングを防ぐために各プロパティを詳細に比較
 */
const areMisskeyNotePropsEqual = (
  prevProps: { note: Note; origin: string },
  nextProps: { note: Note; origin: string },
): boolean => {
  // 基本的なプロパティの比較
  if (
    prevProps.note.id !== nextProps.note.id ||
    prevProps.note.text !== nextProps.note.text ||
    prevProps.origin !== nextProps.origin ||
    prevProps.note.renote?.id !== nextProps.note.renote?.id
  ) {
    return false;
  }

  // ユーザー情報の比較
  if (
    prevProps.note.user.name !== nextProps.note.user.name ||
    prevProps.note.user.username !== nextProps.note.user.username ||
    prevProps.note.user.avatarUrl !== nextProps.note.user.avatarUrl
  ) {
    return false;
  }

  // 絵文字オブジェクトの深い比較
  if (
    !areEmojisEqual(prevProps.note.emojis || {}, nextProps.note.emojis || {}) ||
    !areEmojisEqual(
      prevProps.note.user.emojis || {},
      nextProps.note.user.emojis || {},
    )
  ) {
    return false;
  }

  return true;
};

const MisskeyNote = memo(MisskeyNoteBase, areMisskeyNotePropsEqual);

export { MisskeyNote };
