import type { Note } from "misskey-js/entities.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Text from "@/components/ui/text";
import { MfmText } from "@/features/mfm";
import { cn } from "@/lib/utils";

interface ReplyTargetPreviewProps {
  note: Note;
  origin?: string;
}

const normalizeOrigin = (origin: string | undefined): string => {
  if (!origin) return "";
  const hasProtocol = /^https?:\/\//.test(origin);
  const normalized = (hasProtocol ? origin : `https://${origin}`).replace(
    /\/$/,
    "",
  );
  return normalized;
};

export function ReplyTargetPreview({ note, origin }: ReplyTargetPreviewProps) {
  const { t } = useTranslation("notes");
  const displayName = note.user.name || note.user.username;
  const username = note.user.username;
  const createdAt = useMemo(() => {
    if (!note.createdAt) return "";
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(note.createdAt));
    } catch {
      return note.createdAt;
    }
  }, [note.createdAt]);

  const attachments = note.files?.slice(0, 4) ?? [];
  const normalizedOrigin = normalizeOrigin(origin ?? note.origin);
  const host = note.user.host
    ? note.user.host.replace(/^https?:\/\//, "")
    : normalizedOrigin.replace(/^https?:\/\//, "");
  const identity = host ? `@${username}@${host}` : `@${username}`;

  return (
    <div className="space-y-3 rounded-md border bg-muted/40 p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={note.user.avatarUrl || undefined}
            alt={displayName}
          />
          <AvatarFallback>
            {displayName?.slice(0, 2)?.toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <Text affects="small" className="font-semibold">
            {displayName}
          </Text>
          <Text affects="xsmall" className="text-muted-foreground">
            {identity}
            {createdAt ? ` · ${createdAt}` : ""}
          </Text>
        </div>
      </div>

      {note.text ? (
        <MfmText
          text={note.text}
          host={origin ?? note.origin ?? ""}
          emojis={note.emojis ?? {}}
        />
      ) : (
        <Text affects="small" className="text-muted-foreground">
          {t("compose.replyTarget.noText")}
        </Text>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {attachments.map((file) => (
            <img
              key={file.id}
              src={file.thumbnailUrl ?? file.url}
              alt={file.name ?? "attachment"}
              className={cn(
                "h-24 w-full rounded-md border object-cover",
                !file.thumbnailUrl && "bg-muted",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
