import { valibotResolver } from "@hookform/resolvers/valibot";
import { APIClient } from "misskey-js/api.js";
import type { Note } from "misskey-js/entities.js";
import type { BaseSyntheticEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";

type NoteComposerMode = "create" | "reply" | "quote";

interface UseNoteComposerOptions {
  mode: NoteComposerMode;
  replyTarget?: Note;
  replyOrigin?: string;
  quoteTarget?: Note;
  quoteOrigin?: string;
  initialServerId?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export interface NoteComposerFormValues {
  serverSessionId: string;
  noteContent: string;
  isLocalOnly: boolean;
  visibility: "public" | "home" | "followers" | "specified";
}

interface UseNoteComposerReturn {
  form: UseFormReturn<NoteComposerFormValues>;
  files: File[];
  setFiles: (files: File[]) => void;
  isSubmitting: boolean;
  submitError: string | null;
  clearSubmitError: () => void;
  serversWithToken: MisskeyServerConnection[];
  isLoadingServers: boolean;
  handleSubmit: (event?: BaseSyntheticEvent) => Promise<void> | void;
  resetState: () => void;
}

let lastSelectedServerId: string | undefined;

const normalizeOrigin = (origin: string | null | undefined): string => {
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

const createFormSchema = (
  t: ReturnType<typeof useTranslation>["t"],
  mode: NoteComposerMode,
) =>
  v.object({
    serverSessionId: v.pipe(
      v.string(),
      v.nonEmpty(t("newNote.validation.selectServer")),
    ),
    noteContent:
      mode === "create"
        ? v.pipe(
            v.string(),
            v.minLength(1, t("newNote.validation.enterContent")),
          )
        : v.string(),
    isLocalOnly: v.boolean(),
    visibility: v.picklist(
      ["public", "home", "followers", "specified"] as const,
      t("newNote.validation.selectVisibility"),
    ),
  });

export function useNoteComposer({
  mode,
  replyTarget,
  replyOrigin,
  quoteTarget,
  quoteOrigin,
  initialServerId,
  onSuccess,
  onError,
}: UseNoteComposerOptions): UseNoteComposerReturn {
  const { t } = useTranslation("notes");
  const { servers, currentServerId, isLoading } = useStorage();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const serversWithToken = useMemo(
    () => servers.filter((server) => Boolean(server.accessToken)),
    [servers],
  );

  const schema = useMemo(() => createFormSchema(t, mode), [mode, t]);

  const form = useForm<NoteComposerFormValues>({
    resolver: valibotResolver(schema),
    defaultValues: {
      serverSessionId: "",
      noteContent: "",
      isLocalOnly: false,
      visibility: "public",
    },
  });

  const targetHost = useMemo(() => {
    if (mode === "quote") {
      return (
        quoteOrigin ??
        quoteTarget?.user?.host ??
        replyOrigin ??
        replyTarget?.user?.host ??
        null
      );
    }

    if (mode === "reply") {
      return replyOrigin ?? replyTarget?.user?.host ?? null;
    }

    return null;
  }, [
    mode,
    quoteOrigin,
    quoteTarget?.user?.host,
    replyOrigin,
    replyTarget?.user?.host,
  ]);

  const resolveInitialServerId = useCallback((): string | undefined => {
    if (mode === "reply" || mode === "quote") {
      const targetOrigin = normalizeOrigin(targetHost);
      if (targetOrigin) {
        const originMatch = serversWithToken.find(
          (server) => normalizeOrigin(server.origin) === targetOrigin,
        );
        if (originMatch) return originMatch.id;
      }
    }

    if (initialServerId) {
      const match = serversWithToken.find(
        (server) => server.id === initialServerId,
      );
      if (match) return match.id;
    }

    if (lastSelectedServerId) {
      const lastMatch = serversWithToken.find(
        (server) => server.id === lastSelectedServerId,
      );
      if (lastMatch) return lastMatch.id;
    }

    if (currentServerId) {
      const currentMatch = serversWithToken.find(
        (server) => server.id === currentServerId,
      );
      if (currentMatch) return currentMatch.id;
    }

    return serversWithToken[0]?.id;
  }, [currentServerId, initialServerId, mode, serversWithToken, targetHost]);

  useEffect(() => {
    if (serversWithToken.length === 0) return;
    const resolved = resolveInitialServerId();
    const currentValue = form.getValues("serverSessionId");
    if (resolved && resolved !== currentValue) {
      form.setValue("serverSessionId", resolved, { shouldValidate: false });
    }
  }, [form, resolveInitialServerId, serversWithToken]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "serverSessionId" && value?.serverSessionId) {
        lastSelectedServerId = value.serverSessionId;
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = form.handleSubmit(
    async (values: NoteComposerFormValues) => {
      const selectedServer = serversWithToken.find(
        (server) => server.id === values.serverSessionId,
      );

      if (!selectedServer) {
        setSubmitError(t("compose.error.missingServer"));
        return;
      }

      const trimmed = values.noteContent.trim();
      if (!trimmed && files.length === 0 && mode !== "quote") {
        setSubmitError(t("compose.error.empty"));
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const client = new APIClient({
          origin: selectedServer.origin,
          credential: selectedServer.accessToken,
        });

        const uploadedFileIds = await uploadAndCompressFiles(
          files,
          selectedServer.origin,
          selectedServer.accessToken ?? "",
        );

        await client.request("notes/create", {
          text: trimmed,
          visibility: values.visibility,
          localOnly: values.isLocalOnly,
          fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
          replyId: mode === "reply" ? replyTarget?.id : undefined,
          renoteId:
            mode === "quote" ? (quoteTarget ?? replyTarget)?.id : undefined,
        });

        lastSelectedServerId = values.serverSessionId;
        form.reset({
          serverSessionId: values.serverSessionId,
          noteContent: "",
          isLocalOnly: false,
          visibility: values.visibility,
        });
        setFiles([]);
        onSuccess?.();
      } catch (error) {
        const message = formatError(error) || t("compose.error.generic");
        setSubmitError(message);
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  );

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const resetState = useCallback(() => {
    setFiles([]);
    setSubmitError(null);
    const currentServerId = form.getValues("serverSessionId");
    const currentVisibility = form.getValues("visibility") ?? "public";
    form.reset({
      serverSessionId: currentServerId,
      noteContent: "",
      isLocalOnly: false,
      visibility: currentVisibility,
    });
  }, [form]);

  return {
    form,
    files,
    setFiles,
    isSubmitting,
    submitError,
    clearSubmitError,
    serversWithToken,
    isLoadingServers: isLoading,
    handleSubmit,
    resetState,
  };
}
