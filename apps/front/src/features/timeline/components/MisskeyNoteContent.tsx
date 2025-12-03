import { useAtomValue } from "jotai";
import { EyeOff } from "lucide-react";
import type { Note } from "misskey-js/entities.js";
import { isPureRenote } from "misskey-js/note.js";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomEmojiCtx } from "@/features/emoji";
import { MfmText } from "@/features/mfm";
import { NoteReplySection } from "@/features/notes/components/NoteReplySection";
import { ReactionButton } from "@/features/reactions/components/ReactionButton";
import { timelineSettingsAtom } from "@/features/settings/stores/timelineSettings";
import { cn } from "@/lib/utils";
import { NoteReactions } from "../../reactions/components/NoteReactions";
import { useMisskeyNoteEmojis } from "../hooks/useMisskeyNoteEmojis";
import { MisskeyNoteHeader } from "./MisskeyNoteHeader";
import { RenoteMenu } from "./RenoteMenu";

interface MisskeyNoteContentProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
  depth?: number;
}

type NoteFile = NonNullable<Note["files"]>[number];

const MAX_RENOTE_PREVIEW_DEPTH = 1;

const resolveNoteUrl = (note: Note, origin: string): string => {
  if (note.url) return note.url;
  if (note.uri) return note.uri;

  const hasProtocol = /^https?:\/\//.test(origin);
  const normalizedOrigin = origin
    ? (hasProtocol ? origin : `https://${origin}`).replace(/\/$/, "")
    : "";

  if (!normalizedOrigin) {
    return `/notes/${note.id}`;
  }

  return `${normalizedOrigin}/notes/${note.id}`;
};

function MisskeyNoteContentBase({
  note,
  origin,
  emojis,
  depth = 0,
}: MisskeyNoteContentProps) {
  const user = note.user;
  const isRenote = isPureRenote(note);
  const settings = useAtomValue(timelineSettingsAtom);
  const { t } = useTranslation("settings");
  const { t: tTimeline } = useTranslation("timeline");
  const isNsfw = note.cw || note.files?.some((f) => f.isSensitive);
  const [isRevealed, setIsRevealed] = useState(false);
  const [previewFile, setPreviewFile] = useState<NoteFile | null>(null);

  const handleAttachmentAction = (file: NoteFile) => {
    const shouldRevealOnBlur =
      isNsfw && settings.nsfwBehavior === "blur" && !isRevealed;

    if (shouldRevealOnBlur) {
      setIsRevealed(true);
      return;
    }

    setPreviewFile(file);
  };

  if (isNsfw && settings.nsfwBehavior === "hide" && !isRevealed) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-md border border-muted bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <EyeOff className="h-4 w-4" />
          <span className="font-medium text-sm">
            {t("timeline.nsfw.title")}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRevealed(true)}
          className="w-full sm:w-auto"
        >
          {t("timeline.nsfw.show")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <p>
            <MfmText
              text={user.name || user.username}
              host={origin}
              emojis={emojis}
            />
            <span className="text-muted-foreground">@{user.username}</span>
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {note.text && (
          <MfmText text={note.text} host={origin} emojis={emojis} />
        )}
        {note.files && note.files.length > 0 && (
          <div className="space-y-2">
            {note.files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className={cn(
                    "relative overflow-hidden rounded-md cursor-zoom-in",
                  )}
                onClick={() => handleAttachmentAction(file)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAttachmentAction(file);
                  }
                }}
                aria-label="画像を拡大表示"
              >
                <img
                  src={file.url}
                  alt="Note Attachment"
                  className={cn(
                    "mt-2 h-auto max-w-full rounded-md border",
                    isNsfw &&
                      settings.nsfwBehavior === "blur" &&
                      !isRevealed &&
                      "blur-xl transition-all duration-300",
                  )}
                />
                {isNsfw && settings.nsfwBehavior === "blur" && !isRevealed && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-black/50 px-3 py-1 font-medium text-sm text-white backdrop-blur-sm">
                      {tTimeline("sensitive")}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {note.renote ? (
          <RenotePreview
            renote={note.renote}
            origin={origin}
            depth={depth + 1}
          />
        ) : null}
        <NoteReactions
          note={note}
          origin={origin}
          emojis={note.reactionEmojis}
        />
        {isRenote ? null : (
          <div className="flex items-center gap-2 pt-1">
            <ReactionButton note={note} origin={origin} emojis={emojis} />
            <RenoteMenu note={note} origin={origin} />
            <NoteReplySection note={note} origin={origin} />
          </div>
        )}
      </div>
      <Dialog
        open={Boolean(previewFile)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPreviewFile(null);
          }
        }}
      >
        <DialogContent
          className="max-w-[95vw] p-0 shadow-none"
          onClick={() => setPreviewFile(null)}
        >
          {previewFile && (
            <div className="relative flex max-h-[90vh] w-full cursor-zoom-out items-center justify-center overflow-hidden rounded-lg bg-background p-4">
              <img
                src={previewFile.url}
                alt={previewFile.name || "Note Attachment"}
                className="h-full w-full max-h-[90vh] max-w-[90vw] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const MisskeyNoteContent = memo(MisskeyNoteContentBase);

MisskeyNoteContent.displayName = "MisskeyNoteContent";

function RenotePreview({
  renote,
  origin,
  depth,
}: {
  renote: Note;
  origin: string;
  depth: number;
}) {
  const { emojis, contextValue } = useMisskeyNoteEmojis(renote, origin);

  if (depth > MAX_RENOTE_PREVIEW_DEPTH) {
    const noteUrl = resolveNoteUrl(renote, origin);
    const username = renote.user.username;

    return (
      <div className="mt-2 rounded-md border bg-muted/40 p-3 text-sm">
        <a
          href={noteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          @{username}のノートを見る
        </a>
      </div>
    );
  }

  return (
    <CustomEmojiCtx.Provider value={contextValue}>
      <div className="mt-2 rounded-md border bg-muted/40 p-3">
        <div className="flex items-start gap-2">
          <MisskeyNoteHeader user={renote.user} note={renote} />
          <MisskeyNoteContent
            note={renote}
            origin={origin}
            emojis={emojis}
            depth={depth}
          />
        </div>
      </div>
    </CustomEmojiCtx.Provider>
  );
}
