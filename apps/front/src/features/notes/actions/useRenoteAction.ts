import { APIClient } from "misskey-js/api.js";
import type { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { normalizeOrigin } from "@/lib/utils";

interface UseRenoteActionOptions {
  note: Note;
  origin: string;
}

interface UseRenoteActionResult {
  renoteCount: number;
  isRenoted: boolean;
  isProcessing: boolean;
  canRenote: boolean;
  isStorageLoading: boolean;
  serversWithToken: MisskeyServerConnection[];
  determineInitialServerId: () => string | undefined;
  toggleRenote: (serverSessionId: string) => Promise<void>;
}

const extractMyRenoteId = (note: Note): string | null => {
  const candidate = (note as { myRenoteId?: unknown }).myRenoteId;
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : null;
};

const ensureServer = (
  serverSessionId: string,
  servers: MisskeyServerConnection[],
): MisskeyServerConnection | undefined =>
  servers.find((server) => server.id === serverSessionId);

const extractCreatedRenoteId = (response: unknown): string | null => {
  if (!response || typeof response !== "object") return null;
  const obj = response as Record<string, unknown>;

  const candidates = [
    obj.createdNoteId,
    (obj.createdNote as { id?: string })?.id,
    obj.id,
    (obj.note as { id?: string })?.id,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
};

const extractDeletedRenoteId = (response: unknown): string | null => {
  if (!response || typeof response !== "object") return null;
  const obj = response as Record<string, unknown>;

  const candidate = obj.deletedRenoteId ?? obj.renoteId ?? obj.id;
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : null;
};

export function useRenoteAction({
  note,
  origin,
}: UseRenoteActionOptions): UseRenoteActionResult {
  const { t } = useTranslation("timeline");
  const {
    servers,
    currentServerId,
    isLoading: isStorageLoading,
  } = useStorage();

  const serversWithToken = useMemo(
    () => servers.filter((server) => Boolean(server.accessToken)),
    [servers],
  );

  const initialRenoteId = useMemo(() => extractMyRenoteId(note), [note]);

  const [renoteCount, setRenoteCount] = useState<number>(
    typeof note.renoteCount === "number" ? note.renoteCount : 0,
  );
  const [currentRenoteId, setCurrentRenoteId] = useState<string | null>(
    initialRenoteId,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setRenoteCount(typeof note.renoteCount === "number" ? note.renoteCount : 0);
    setCurrentRenoteId(extractMyRenoteId(note));
  }, [note]);

  const determineInitialServerId = useCallback((): string | undefined => {
    if (serversWithToken.length === 0) return undefined;

    const targetOrigin =
      normalizeOrigin(note.user?.host) || normalizeOrigin(origin);
    if (targetOrigin) {
      const originMatch = serversWithToken.find(
        (server) => normalizeOrigin(server.origin) === targetOrigin,
      );
      if (originMatch) return originMatch.id;
    }

    if (currentServerId) {
      const currentMatch = serversWithToken.find(
        (server) => server.id === currentServerId,
      );
      if (currentMatch) return currentMatch.id;
    }

    return serversWithToken[0]?.id;
  }, [currentServerId, note, origin, serversWithToken]);

  const toggleRenote = useCallback(
    async (serverSessionId: string) => {
      if (!serverSessionId) {
        toast({
          variant: "destructive",
          title: t("renote.error.title"),
          description: t("renote.error.noServer"),
        });
        return;
      }

      const server = ensureServer(serverSessionId, serversWithToken);
      if (!server || !server.accessToken) {
        toast({
          variant: "destructive",
          title: t("renote.error.title"),
          description: t("renote.error.noServer"),
        });
        return;
      }

      const previouslyRenotedId = currentRenoteId;
      const previousCount = renoteCount;
      const alreadyRenoted = Boolean(previouslyRenotedId);

      setIsProcessing(true);
      setRenoteCount((prev) =>
        alreadyRenoted ? Math.max(prev - 1, 0) : prev + 1,
      );
      if (alreadyRenoted) {
        setCurrentRenoteId(null);
      }

      try {
        const client = new APIClient({
          origin: server.origin,
          credential: server.accessToken,
        });

        if (alreadyRenoted) {
          const response = await client.request("notes/unrenote", {
            noteId: previouslyRenotedId ?? note.id,
          });
          const deletedId = extractDeletedRenoteId(response);
          if (deletedId && deletedId !== previouslyRenotedId) {
            // Ensure we keep consistent state if API returns different id
            setCurrentRenoteId(null);
          }
        } else {
          const response = await client.request("notes/create", {
            renoteId: note.id,
          });
          const createdId = extractCreatedRenoteId(response);
          if (createdId) {
            setCurrentRenoteId(createdId);
          } else {
            // Fallback: keep optimistic state but warn in console
            console.warn("Renote created without id in response", response);
          }
        }
      } catch (error) {
        console.error("Failed to toggle renote:", error);
        setRenoteCount(previousCount);
        setCurrentRenoteId(previouslyRenotedId ?? null);
        toast({
          variant: "destructive",
          title: t("renote.error.title"),
          description: alreadyRenoted
            ? t("renote.error.unrenoteFailed")
            : t("renote.error.renoteFailed"),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [currentRenoteId, note.id, renoteCount, serversWithToken, t],
  );

  return {
    renoteCount,
    isRenoted: Boolean(currentRenoteId),
    isProcessing,
    canRenote: serversWithToken.length > 0 && !isProcessing,
    isStorageLoading,
    serversWithToken,
    determineInitialServerId,
    toggleRenote,
  };
}
