import { Loader2, MessageCircle } from "lucide-react";
import { APIClient } from "misskey-js/api.js";
import type { Note } from "misskey-js/entities.js";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Text from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useStorage } from "@/lib/storage/context";
import { cn } from "@/lib/utils";

let lastSelectedServerId: string | undefined;

const normalizeOrigin = (origin: string | undefined): string => {
  if (!origin) return "";
  const hasProtocol = /^https?:\/\//.test(origin);
  const normalized = (hasProtocol ? origin : `https://${origin}`).replace(
    /\/$/,
    "",
  );
  return normalized.toLowerCase();
};

const formatError = (error: unknown): string => {
  if (!error) return "";
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    "message" in (error as Record<string, unknown>)
  ) {
    const errObj = error as { message?: string; code?: string };
    if (errObj.message) {
      return errObj.message;
    }
    if (errObj.code) {
      return `API Error: ${errObj.code}`;
    }
  }
  return "Unknown error";
};

interface NoteReplySectionProps {
  note: Note;
  origin: string;
}

export function NoteReplySection({ note, origin }: NoteReplySectionProps) {
  const { t } = useTranslation("timeline");
  const { servers, currentServerId, isLoading } = useStorage();

  const noteOrigin = normalizeOrigin(origin);
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
  const serversWithToken = useMemo(
    () => servers.filter((server) => Boolean(server.accessToken)),
    [servers],
  );

  const initialServerId = useMemo(() => {
    const originMatch = serversWithToken.find(
      (server) => normalizeOrigin(server.origin) === noteOrigin,
    );
    if (originMatch) return originMatch.id;

    const lastSelected = lastSelectedServerId
      ? serversWithToken.find((server) => server.id === lastSelectedServerId)
      : undefined;
    if (lastSelected) return lastSelected.id;

    const currentSelected = currentServerId
      ? serversWithToken.find((server) => server.id === currentServerId)
      : undefined;
    if (currentSelected) return currentSelected.id;

    return serversWithToken[0]?.id;
  }, [noteOrigin, serversWithToken, currentServerId]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [serverId, setServerId] = useState<string | undefined>(initialServerId);
  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedServer = useMemo(
    () => serversWithToken.find((server) => server.id === serverId),
    [serverId, serversWithToken],
  );

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    setSubmitError(null);
  };

  const handleSelectChange = (value: string) => {
    setServerId(value);
    lastSelectedServerId = value;
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setSubmitError(t("reply.error.empty"));
      return;
    }
    if (!selectedServer) {
      setSubmitError(t("reply.error.missingServer"));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const client = new APIClient({
        origin: selectedServer.origin,
        credential: selectedServer.accessToken,
      });

      await client.request("notes/create", {
        text: trimmed,
        replyId: note.id,
        visibility: "public",
      });

      setSuccessMessage(t("reply.success"));
      setContent("");
      setIsDialogOpen(false);
    } catch (error) {
      const message = formatError(error);
      setSubmitError(message || t("reply.error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAvailableServer = serversWithToken.length > 0;
  const isReplyDisabled = isLoading || !hasAvailableServer || isPureRenote;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <div className="flex items-center gap-2">
        {!isReplyDisabled && (
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-muted-foreground hover:text-foreground",
                isLoading && "cursor-not-allowed opacity-50",
              )}
              aria-label={t("reply.button")}
            >
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
              <span className="sr-only">{t("reply.button")}</span>
            </Button>
          </DialogTrigger>
        )}
        {!hasAvailableServer && (
          <Text affects="small" className="text-muted-foreground">
            {t("reply.error.noServer")}
          </Text>
        )}
      </div>

      {successMessage && !isDialogOpen && (
        <Text affects="small" className="text-muted-foreground">
          {successMessage}
        </Text>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reply.button")}</DialogTitle>
          <DialogDescription>{t("reply.placeholder")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Text affects="small" className="font-medium">
              {t("reply.serverLabel")}
            </Text>
            <Select
              onValueChange={handleSelectChange}
              value={serverId}
              disabled={serversWithToken.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("reply.serverPlaceholder") ?? ""} />
              </SelectTrigger>
              <SelectContent>
                {serversWithToken.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.origin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Text affects="small" className="font-medium">
              {t("reply.placeholder")}
            </Text>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("reply.placeholder") ?? ""}
              className="min-h-[96px]"
            />
          </div>

          {submitError ? (
            <Text affects="small" className="text-destructive">
              {submitError}
            </Text>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsDialogOpen(false);
              setSubmitError(null);
              if (!content) {
                setSuccessMessage(null);
              }
            }}
          >
            {t("reply.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedServer}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                {t("reply.submitting")}
              </>
            ) : (
              t("reply.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
