import { MessageCircle } from "lucide-react";
import type { Note } from "misskey-js/entities.js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { NoteComposerDialog } from "@/features/compose-dialog/components/NoteComposerDialog";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { cn } from "@/lib/utils";

const normalizeOrigin = (origin: string | undefined): string => {
  if (!origin) return "";
  const hasProtocol = /^https?:\/\//.test(origin);
  const normalized = (hasProtocol ? origin : `https://${origin}`).replace(
    /\/$/,
    "",
  );
  return normalized.toLowerCase();
};

export interface ReplyAvailability {
  isPureRenote: boolean;
  serversWithToken: MisskeyServerConnection[];
  initialServerId: string | undefined;
  isReplyDisabled: boolean;
  isLoading: boolean;
  hasAvailableServer: boolean;
}

export function useReplyAvailability(note: Note, origin: string) {
  const { servers, currentServerId, isLoading } = useStorage();
  const noteOrigin = normalizeOrigin(origin);
  const serversWithToken = useMemo(
    () => servers.filter((server) => Boolean(server.accessToken)),
    [servers],
  );

  const isPureRenote = useMemo(() => {
    const hasRenote = Boolean(note.renoteId || note.renote);
    const hasText = Boolean(note.text && note.text.trim().length > 0);
    const hasFiles = Boolean(note.files && note.files.length > 0);
    const hasPoll = Boolean(
      (note as { poll?: unknown; fileIds?: string[] }).poll,
    );
    const hasAttachments = hasFiles || hasPoll;
    return hasRenote && !hasText && !hasAttachments;
  }, [note]);

  const initialServerId = useMemo(() => {
    const originMatch = serversWithToken.find(
      (server) => normalizeOrigin(server.origin) === noteOrigin,
    );
    if (originMatch) return originMatch.id;

    const currentSelected = currentServerId
      ? serversWithToken.find((server) => server.id === currentServerId)
      : undefined;
    if (currentSelected) return currentSelected.id;

    return serversWithToken[0]?.id;
  }, [noteOrigin, serversWithToken, currentServerId]);

  const hasAvailableServer = serversWithToken.length > 0;
  const isReplyDisabled = isLoading || !hasAvailableServer;

  return {
    isPureRenote,
    serversWithToken,
    initialServerId,
    isReplyDisabled,
    isLoading,
    hasAvailableServer,
  };
}

interface NoteReplySectionProps {
  note: Note;
  origin: string;
  availability?: ReplyAvailability;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NoteReplySection({
  note,
  origin,
  availability,
  open,
  onOpenChange,
}: NoteReplySectionProps) {
  const { t } = useTranslation("timeline");
  const {
    isPureRenote,
    isReplyDisabled,
    isLoading,
    serversWithToken,
    initialServerId,
  } = availability ?? useReplyAvailability(note, origin);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isPureRenote) {
    return null;
  }

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(open ?? false);

  useEffect(() => {
    if (open === undefined) return;
    setInternalOpen(open);
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    if (nextOpen) {
      setSuccessMessage(null);
    }
    onOpenChange?.(nextOpen);
  };

  const dialogOpen = isControlled ? (open ?? false) : internalOpen;

  const baseButtonClass = cn(
    "h-8 px-3 text-muted-foreground hover:text-foreground",
    isLoading && "cursor-not-allowed opacity-50",
  );

  const triggerButton = (
    <Button
      variant="ghost"
      size="sm"
      className={baseButtonClass}
      aria-label={t("reply.button")}
    >
      <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
      <span className="sr-only">{t("reply.button")}</span>
    </Button>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <NoteComposerDialog
          mode="reply"
          trigger={triggerButton}
          disabled={isReplyDisabled}
          replyTarget={note}
          origin={origin}
          initialServerId={initialServerId}
          onSuccess={() => setSuccessMessage(t("reply.success"))}
          open={dialogOpen}
          onOpenChange={handleOpenChange}
          showSuccessMessage={false}
        />
      </div>

      {successMessage && (
        <Text affects="small" className="text-muted-foreground">
          {successMessage}
        </Text>
      )}
    </div>
  );
}
