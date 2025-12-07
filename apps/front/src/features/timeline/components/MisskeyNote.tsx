import { CornerUpRight, Repeat2 } from "lucide-react";
import type { Note } from "misskey-js/entities.js";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomEmojiCtx } from "@/features/emoji";
import { useRenoteAction } from "@/features/notes/actions/useRenoteAction";
import { useReplyAvailability } from "@/features/notes/components/NoteReplySection";
import { cn } from "@/lib/utils";
import type { CustomEmojiContext } from "@/types/emoji";
import { useMisskeyNoteEmojis } from "../hooks/useMisskeyNoteEmojis";
import { MisskeyNoteContent } from "./MisskeyNoteContent";
import { MisskeyNoteHeader } from "./MisskeyNoteHeader";
import { NoteContextMenu } from "./NoteContextMenu";

type MisskeyNoteDisplayProps = {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
  contextValue?: CustomEmojiContext;
};

// Component to display a single Misskey note with a Twitter-like design
function MisskeyNoteBase({
  note,
  origin,
  emojis,
  contextValue,
}: MisskeyNoteDisplayProps) {
  const { t } = useTranslation("timeline");
  const providerValue = contextValue ?? {
    host: origin || null,
    emojis,
  };
  const renoteAction = useRenoteAction({ note, origin });
  const replyState = useReplyAvailability(note, origin);
  const [reactionMenuOpen, setReactionMenuOpen] = useState(false);
  const [renoteDialogOpen, setRenoteDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const replyTarget =
    note.reply || (note.replyId ? { id: note.replyId } : null);
  const replyUrl = replyTarget
    ? resolveNoteUrl(replyTarget as Partial<Note> & { id: string }, origin)
    : null;

  const hasServers = renoteAction.serversWithToken.length > 0;
  const renoteDisabled =
    (!hasServers && !renoteAction.isRenoted) || renoteAction.isProcessing;
  const quoteDisabled = !hasServers || renoteAction.isProcessing;
  const replyDisabled = replyState.isReplyDisabled;
  const showActions = !replyState.isPureRenote;

  useEffect(() => {
    setReactionMenuOpen(false);
    setRenoteDialogOpen(false);
    setQuoteDialogOpen(false);
    setReplyDialogOpen(false);
    setContextMenuPosition(null);
  }, []);

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (!showActions) return;
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  const handleOpenReaction = () => {
    setReactionMenuOpen(true);
    closeContextMenu();
  };

  const handleOpenReply = () => {
    if (replyDisabled) return;
    setReplyDialogOpen(true);
    closeContextMenu();
  };

  const handleOpenRenote = () => {
    if (renoteDisabled) return;
    setRenoteDialogOpen(true);
    closeContextMenu();
  };

  const handleOpenQuote = () => {
    if (quoteDisabled) return;
    setQuoteDialogOpen(true);
    closeContextMenu();
  };

  return (
    <CustomEmojiCtx.Provider value={providerValue}>
      <article
        className={cn(
          "flex items-start gap-3 border-b p-3 transition-colors duration-200 hover:bg-muted/50",
        )}
        onContextMenu={handleContextMenu}
      >
        <div>
          <MisskeyNoteHeader user={note.user} note={note} />
        </div>
        <div className="min-w-0 flex-1">
          {note.renote && (
            <div className="mb-1 flex items-center gap-1 text-muted-foreground text-xs">
              <Repeat2 className="h-3.5 w-3.5" aria-hidden />
              <span>Renote</span>
            </div>
          )}
          {note.replyId && (
            <div className="mb-1 flex items-center gap-1 text-muted-foreground text-xs">
              <CornerUpRight className="h-3.5 w-3.5" aria-hidden />
              {replyUrl ? (
                <a
                  href={replyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {t("reply.badge")}
                </a>
              ) : (
                <span>{t("reply.badge")}</span>
              )}
            </div>
          )}
          <MisskeyNoteContent
            note={note}
            origin={origin}
            emojis={emojis}
            renoteAction={renoteAction}
            replyAvailability={replyState}
            reactionMenuOpen={reactionMenuOpen}
            renoteDialogOpen={renoteDialogOpen}
            quoteDialogOpen={quoteDialogOpen}
            replyDialogOpen={replyDialogOpen}
            onReactionMenuOpenChange={(open) => {
              setReactionMenuOpen(open);
              if (!open) {
                closeContextMenu();
              }
            }}
            onRenoteDialogOpenChange={(open) => {
              setRenoteDialogOpen(open);
              if (!open) {
                closeContextMenu();
              }
            }}
            onQuoteDialogOpenChange={(open) => {
              setQuoteDialogOpen(open);
              if (!open) {
                closeContextMenu();
              }
            }}
            onReplyDialogOpenChange={(open) => {
              setReplyDialogOpen(open);
              if (!open) {
                closeContextMenu();
              }
            }}
          />
        </div>
      </article>
      {contextMenuPosition && showActions ? (
        <NoteContextMenu
          position={contextMenuPosition}
          onClose={closeContextMenu}
          onReact={handleOpenReaction}
          onReply={handleOpenReply}
          onRenote={handleOpenRenote}
          onQuote={handleOpenQuote}
          labels={{
            react: "リアクションする",
            reply: t("reply.button"),
            renote: renoteAction.isRenoted
              ? t("renote.menu.undoRenote")
              : t("renote.menu.renote"),
            quote: t("renote.menu.quote"),
          }}
          replyDisabled={replyDisabled}
          renoteDisabled={renoteDisabled}
          quoteDisabled={quoteDisabled}
        />
      ) : null}
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

const resolveNoteUrl = (
  note: Partial<Note> & { id: string },
  origin: string,
): string => {
  if ("url" in note && note.url) return note.url as string;
  if ("uri" in note && note.uri) return note.uri as string;

  const hasProtocol = /^https?:\/\//.test(origin);
  const normalizedOrigin = origin
    ? (hasProtocol ? origin : `https://${origin}`).replace(/\/$/, "")
    : "";

  if (!normalizedOrigin) {
    return `/notes/${note.id}`;
  }

  return `${normalizedOrigin}/notes/${note.id}`;
};

const MisskeyNoteDisplay = memo(MisskeyNoteBase);

function MisskeyNoteWithFetch({
  note,
  origin,
}: {
  note: Note;
  origin: string;
}) {
  const { emojis, contextValue } = useMisskeyNoteEmojis(note, origin);

  return (
    <MisskeyNoteDisplay
      note={note}
      origin={origin}
      emojis={emojis}
      contextValue={contextValue}
    />
  );
}

const MisskeyNote = memo(MisskeyNoteWithFetch, areMisskeyNotePropsEqual);

export { MisskeyNote, MisskeyNoteDisplay };
