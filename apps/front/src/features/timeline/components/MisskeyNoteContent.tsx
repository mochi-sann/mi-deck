import { useAtomValue } from "jotai";
import type { Note } from "misskey-js/entities.js";
import { isPureRenote } from "misskey-js/note.js";
import { memo, useState } from "react";
import { CustomEmojiCtx } from "@/features/emoji";
import { MfmText } from "@/features/mfm";
import { NoteReplySection } from "@/features/notes/components/NoteReplySection";
import { ReactionButton } from "@/features/reactions/components/ReactionButton";
import { timelineSettingsAtom } from "@/features/settings/stores/timelineSettings";
import { useStorage } from "@/lib/storage/context";
import { NoteReactions } from "../../reactions/components/NoteReactions";
import { useMisskeyNoteEmojis } from "../hooks/useMisskeyNoteEmojis";
import { AttachmentGallery } from "./AttachmentGallery";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { MisskeyNoteHeader } from "./MisskeyNoteHeader";
import { NoteFile } from "./NoteAttachmentTypes";
import { NsfwBarrier } from "./NsfwBarrier";
import { RenoteMenu } from "./RenoteMenu";

interface MisskeyNoteContentProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
  depth?: number;
}

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
  const { servers, addTimeline } = useStorage();

  const isNsfw =
    Boolean(note.cw) ||
    Boolean(note.files?.some((f: NoteFile) => f.isSensitive));
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

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const server = servers.find((s) => s.origin === origin);
    if (server) {
      addTimeline({
        name: user.name || user.username,
        serverId: server.id,
        type: "user",
        order: Date.now(), // Temporary order, backend/storage should handle this or list component will sort
        isVisible: true,
        settings: {
          userId: user.id,
        },
      });
    } else {
      console.error("Server not found for origin:", origin);
    }
  };

  if (isNsfw && settings.nsfwBehavior === "hide" && !isRevealed) {
    return <NsfwBarrier onReveal={() => setIsRevealed(true)} />;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={handleUserClick}
            className="flex items-center gap-2 hover:underline appearance-none bg-transparent border-0 p-0 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <p>
                <MfmText
                  text={user.name || user.username}
                  host={origin}
                  emojis={emojis}
                />
              </p>
              <span className="text-muted-foreground ml-1">
                @{user.username}
              </span>
            </div>
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {note.text && (
          <MfmText text={note.text} host={origin} emojis={emojis} />
        )}
        {note.files && note.files.length > 0 && (
          <AttachmentGallery
            files={note.files}
            settings={settings}
            isNsfw={isNsfw}
            isRevealed={isRevealed}
            onAttachmentClick={handleAttachmentAction}
          />
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
      <ImagePreviewDialog
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
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
          <MisskeyNoteHeader user={renote.user} note={renote} origin={origin} />
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
