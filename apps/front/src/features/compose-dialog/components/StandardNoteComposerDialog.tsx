import { Globe, Home, ImagePlus, Lock, Mail } from "lucide-react";
import type { ClipboardEvent, DragEvent, ReactElement } from "react";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { FileUpload } from "@/components/parts/FileUpload";
import { Badge } from "@/components/ui/badge";
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
import { Form, FormControl, FormField } from "@/components/ui/form";
import { InputGroupTextarea } from "@/components/ui/input-group";
import Text from "@/components/ui/text";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { cn } from "@/lib/utils";
import { ReplyTargetPreview } from "../../notes/components/ReplyTargetPreview";
import {
  type NoteComposerFormValues,
  useNoteComposer,
} from "../hooks/useNoteComposer";
import type { NoteComposerDialogProps } from "../lib/note-composer-types";
import { ComposerFieldGroup } from "./ComposerFieldGroup";
import { ComposerFieldActions } from "./standard/ComposerFieldActions";
import { ComposerLocalOnlyField } from "./standard/ComposerLocalOnlyField";
import { createComposerFieldIds } from "./standard/types";

const MAX_NOTE_LENGTH = 3000;

const getServerDisplayName = (server: MisskeyServerConnection) =>
  server.userInfo?.name ?? server.userInfo?.username ?? server.origin;

const getServerSubtitle = (server: MisskeyServerConnection) => {
  const host = server.origin.replace(/^https?:\/\//, "");
  if (server.userInfo?.username) {
    return `${server.userInfo.username}@${host}`;
  }
  return host;
};

export function StandardNoteComposerDialog({
  mode,
  trigger,
  disabled,
  replyTarget,
  quoteTarget,
  origin,
  initialServerId,
  open: controlledOpen,
  onSuccess,
  onError,
  onOpenChange,
  showSuccessMessage = true,
}: NoteComposerDialogProps) {
  if (mode === "renote") {
    throw new Error("Renote mode is handled separately");
  }

  const { t } = useTranslation("notes");
  const resolvedQuoteTarget = quoteTarget ?? replyTarget;
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(controlledOpen ?? false);

  useEffect(() => {
    if (isControlled) {
      setInternalOpen(controlledOpen ?? false);
    }
  }, [controlledOpen, isControlled]);

  const open = isControlled ? (controlledOpen ?? false) : internalOpen;

  const emitOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const isQuoteMode = mode === "quote";
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const baseFieldId = useId();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isServerPopoverOpen, setIsServerPopoverOpen] = useState(false);
  const [isVisibilityPopoverOpen, setIsVisibilityPopoverOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const {
    form,
    files,
    setFiles,
    isSubmitting,
    submitError,
    clearSubmitError,
    serversWithToken,
    isLoadingServers,
    handleSubmit,
    resetState,
  } = useNoteComposer({
    mode,
    replyTarget,
    replyOrigin: origin,
    quoteTarget: resolvedQuoteTarget,
    quoteOrigin: origin,
    initialServerId,
    onSuccess: () => {
      emitOpenChange(false);
      setSuccessMessage(
        mode === "reply"
          ? t("compose.success.reply")
          : mode === "quote"
            ? t("compose.success.quote")
            : t("compose.success.create"),
      );
      onSuccess?.();
    },
    onError,
  });

  const visibilityOptions = useMemo(
    () => [
      {
        value: "public",
        label: t("compose.visibility.public"),
        icon: Globe,
      },
      { value: "home", label: t("compose.visibility.home"), icon: Home },
      {
        value: "followers",
        label: t("compose.visibility.followers"),
        icon: Lock,
      },
      {
        value: "specified",
        label: t("compose.visibility.specified"),
        icon: Mail,
      },
    ],
    [t],
  );

  const serverSessionIdValue = form.watch("serverSessionId") ?? "";
  const visibilityValue = form.watch("visibility") ?? "public";
  const noteContentValue = form.watch("noteContent") ?? "";

  const selectedServer = useMemo(
    () => serversWithToken.find((server) => server.id === serverSessionIdValue),
    [serverSessionIdValue, serversWithToken],
  );
  const selectedVisibility = useMemo(
    () => visibilityOptions.find((option) => option.value === visibilityValue),
    [visibilityOptions, visibilityValue],
  );

  const remainingCharacters = MAX_NOTE_LENGTH - noteContentValue.length;
  const isCharacterWarning = noteContentValue.length >= MAX_NOTE_LENGTH * 0.9;
  const isCharacterLimitExceeded = remainingCharacters < 0;
  const fileStatusText = files.length
    ? t("compose.attachmentsCount", { count: files.length })
    : t("compose.attachmentsEmpty");
  const attachmentsDescription = t("compose.attachmentsDescription");
  const formDisabled = disabled || isSubmitting;
  const emojiOrigin = selectedServer?.origin ?? origin ?? "";
  const canUseEmoji = Boolean(selectedServer);
  const characterStatusClass = cn(
    "font-mono text-xs",
    isCharacterLimitExceeded
      ? "text-destructive"
      : isCharacterWarning
        ? "text-yellow-600 dark:text-yellow-400"
        : undefined,
  );
  const serverError = form.formState.errors.serverSessionId?.message;
  const visibilityError = form.formState.errors.visibility?.message;
  const serverButtonLabel = selectedServer
    ? `${t("compose.serverLabel")}: ${getServerDisplayName(selectedServer)}`
    : t("compose.serverLabel");
  const visibilityButtonLabel = selectedVisibility
    ? `${t("compose.visibilityLabel")}: ${selectedVisibility.label}`
    : t("compose.visibilityLabel");

  const handleEmojiSelect = useCallback(
    (emojiName: string) => {
      const emojiText = `:${emojiName}:`;
      const currentValue = form.getValues("noteContent") ?? "";
      const textarea = noteTextareaRef.current;

      if (textarea) {
        const start = textarea.selectionStart ?? currentValue.length;
        const end = textarea.selectionEnd ?? currentValue.length;
        const nextValue =
          currentValue.slice(0, start) + emojiText + currentValue.slice(end);
        form.setValue("noteContent", nextValue, { shouldDirty: true });
        requestAnimationFrame(() => {
          const position = start + emojiText.length;
          textarea.focus();
          textarea.setSelectionRange(position, position);
        });
      } else {
        form.setValue("noteContent", `${currentValue}${emojiText}`, {
          shouldDirty: true,
        });
      }

      setIsEmojiPickerOpen(false);
    },
    [form],
  );

  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const registerFileInput = useCallback((element: HTMLInputElement | null) => {
    fileInputRef.current = element;
  }, []);

  const handleDragOverFiles = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (formDisabled) return;
      if (event.dataTransfer?.types?.includes("Files")) {
        event.preventDefault();
        setIsDraggingFile(true);
      }
    },
    [formDisabled],
  );

  const handleDropFiles = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (formDisabled) {
        setIsDraggingFile(false);
        return;
      }

      const droppedFiles = Array.from(event.dataTransfer?.files ?? []).filter(
        (file) => file.type.startsWith("image/"),
      );

      if (droppedFiles.length === 0) {
        setIsDraggingFile(false);
        return;
      }

      event.preventDefault();
      setFiles((prev) => [...prev, ...droppedFiles]);
      setIsDraggingFile(false);
    },
    [formDisabled, setFiles],
  );

  const handleDragLeaveFiles = useCallback((event: DragEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDraggingFile(false);
  }, []);

  const handlePasteFiles = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      if (formDisabled) return;
      const pastedFiles = Array.from(event.clipboardData?.files ?? []).filter(
        (file) => file.type.startsWith("image/"),
      );
      if (pastedFiles.length === 0) return;
      setFiles((prev) => [...prev, ...pastedFiles]);
    },
    [formDisabled, setFiles],
  );

  const handleServerSelect = useCallback(
    (serverId: string) => {
      form.setValue("serverSessionId", serverId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form],
  );

  const handleVisibilitySelect = useCallback(
    (visibility: NoteComposerFormValues["visibility"]) => {
      form.setValue("visibility", visibility, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form],
  );

  const fieldIds = useMemo(
    () => createComposerFieldIds(baseFieldId),
    [baseFieldId],
  );

  useEffect(() => {
    if (!open) {
      resetState();
      clearSubmitError();
      setIsEmojiPickerOpen(false);
      setIsServerPopoverOpen(false);
      setIsVisibilityPopoverOpen(false);
    }
  }, [open, resetState, clearSubmitError]);

  const handleDialogChange = (nextOpen: boolean) => {
    if (disabled && nextOpen) return;
    if (nextOpen) {
      setSuccessMessage(null);
    }
    emitOpenChange(nextOpen);
  };

  const triggerNode = useMemo(() => {
    if (!trigger) return null;
    if (!isValidElement(trigger)) return trigger;
    const triggerElement = trigger as ReactElement<{ disabled?: boolean }>;
    return cloneElement(triggerElement, {
      disabled: disabled ?? triggerElement.props.disabled,
    });
  }, [disabled, trigger]);

  return (
    <>
      {showSuccessMessage && successMessage && (
        <Text affects="small" className="mt-2 text-muted-foreground">
          {successMessage}
        </Text>
      )}
      <Dialog open={open} onOpenChange={handleDialogChange}>
        {triggerNode ? (
          <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        ) : null}
        <DialogContent
          onOpenAutoFocus={(event) => {
            // prevent default auto focus to allow manual control
            event.preventDefault();
          }}
          className="max-h-[100vh] overflow-y-scroll"
        >
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  {mode === "reply"
                    ? t("compose.title.reply")
                    : isQuoteMode
                      ? t("compose.title.quote")
                      : t("compose.title.create")}
                </DialogTitle>
                <DialogDescription>
                  {mode === "reply"
                    ? t("compose.description.reply")
                    : isQuoteMode
                      ? t("compose.description.quote")
                      : t("compose.description.create")}
                </DialogDescription>
              </DialogHeader>

              {(mode === "reply" || isQuoteMode) && resolvedQuoteTarget ? (
                <ReplyTargetPreview
                  note={resolvedQuoteTarget}
                  origin={origin}
                />
              ) : null}

              {serversWithToken.length === 0 ? (
                <Text affects="small" className="text-destructive">
                  {t("compose.error.noServer")}
                </Text>
              ) : null}

              <FormField
                control={form.control}
                name="noteContent"
                render={({ field, fieldState }) => {
                  const describedBy =
                    [
                      fieldIds.content.description,
                      fieldIds.content.status,
                      fieldState.error ? fieldIds.content.error : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .trim()
                      .replace(/\s+/g, " ") || undefined;

                  return (
                    <ComposerFieldGroup
                      label={t("compose.contentLabel")}
                      labelFor={fieldIds.content.control}
                      description={t("compose.contentPlaceholder")}
                      descriptionId={fieldIds.content.description}
                      status={
                        <div className="flex flex-col gap-0.5">
                          <span className={characterStatusClass}>
                            {t("compose.characterCount", {
                              current: noteContentValue.length,
                              max: MAX_NOTE_LENGTH,
                            })}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {t("compose.characterRemaining", {
                              count: Math.max(0, remainingCharacters),
                            })}
                          </span>
                          {serverError ? (
                            <span className="text-destructive text-xs">
                              {serverError}
                            </span>
                          ) : null}
                          {visibilityError ? (
                            <span className="text-destructive text-xs">
                              {visibilityError}
                            </span>
                          ) : null}
                        </div>
                      }
                      statusId={fieldIds.content.status}
                      statusClassName="w-full"
                      error={fieldState.error?.message}
                      errorId={fieldIds.content.error}
                      disabled={disabled}
                      actions={
                        <ComposerFieldActions
                          t={t}
                          serversWithToken={serversWithToken}
                          visibilityOptions={visibilityOptions}
                          isServerPopoverOpen={isServerPopoverOpen}
                          onServerPopoverChange={setIsServerPopoverOpen}
                          isVisibilityPopoverOpen={isVisibilityPopoverOpen}
                          onVisibilityPopoverChange={setIsVisibilityPopoverOpen}
                          isEmojiPickerOpen={isEmojiPickerOpen}
                          onEmojiPickerChange={setIsEmojiPickerOpen}
                          formDisabled={formDisabled}
                          isLoadingServers={isLoadingServers}
                          selectedServer={selectedServer}
                          serverButtonLabel={serverButtonLabel}
                          visibilityButtonLabel={visibilityButtonLabel}
                          currentVisibility={visibilityValue}
                          emojiOrigin={emojiOrigin}
                          canUseEmoji={canUseEmoji}
                          onServerSelect={handleServerSelect}
                          onVisibilitySelect={handleVisibilitySelect}
                          onEmojiSelect={handleEmojiSelect}
                          onOpenFileSelector={openFileSelector}
                          getServerDisplayName={getServerDisplayName}
                          getServerSubtitle={getServerSubtitle}
                        />
                      }
                    >
                      <fieldset
                        className={cn(
                          "flex flex-col gap-3 rounded-md border-0 p-0",
                          isDraggingFile
                            ? "ring-2 ring-ring/50 ring-offset-2 ring-offset-background"
                            : undefined,
                        )}
                        onDragOver={handleDragOverFiles}
                        onDragEnter={handleDragOverFiles}
                        onDragLeave={handleDragLeaveFiles}
                        onDrop={handleDropFiles}
                      >
                        <ComposerLocalOnlyField
                          form={form}
                          fieldIds={fieldIds}
                          disabled={Boolean(disabled)}
                          t={t}
                        />
                        <FormControl>
                          <InputGroupTextarea
                            {...field}
                            id={fieldIds.content.control}
                            aria-describedby={describedBy}
                            placeholder={t("compose.contentPlaceholder")}
                            minLength={0}
                            className="max-h-[200px] min-h-[140px]"
                            disabled={disabled}
                            onPaste={handlePasteFiles}
                            ref={(element) => {
                              field.ref(element);
                              noteTextareaRef.current = element;
                            }}
                          />
                        </FormControl>
                        <div
                          className={cn(
                            "flex flex-col gap-2 rounded-md border border-border/70 border-dashed bg-muted/20 p-3",
                            formDisabled ? "opacity-60" : undefined,
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-medium text-sm">
                              <ImagePlus className="size-4" />
                              <span>{t("compose.attachmentsLabel")}</span>
                              <Badge variant="secondary">{files.length}</Badge>
                            </div>
                            <span
                              id={fieldIds.attachments.status}
                              className="text-muted-foreground text-xs"
                            >
                              {fileStatusText}
                            </span>
                          </div>
                          <Text
                            affects="muted"
                            id={fieldIds.attachments.description}
                            className="text-muted-foreground text-xs"
                          >
                            {attachmentsDescription}
                          </Text>
                          <FormControl>
                            <FileUpload
                              files={files}
                              onFilesChange={setFiles}
                              hideLabel
                              id={fieldIds.attachments.control}
                              disabled={formDisabled}
                              inputRef={registerFileInput}
                              inputProps={{
                                "aria-describedby":
                                  [
                                    fieldIds.attachments.description,
                                    fieldIds.attachments.status,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") || undefined,
                              }}
                            />
                          </FormControl>
                        </div>
                      </fieldset>
                    </ComposerFieldGroup>
                  );
                }}
              />

              {submitError ? (
                <Text affects="small" className="text-destructive">
                  {submitError}
                </Text>
              ) : null}

              <DialogFooter className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  {t("compose.cancel")}
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={
                    disabled || isSubmitting || serversWithToken.length === 0
                  }
                >
                  {mode === "reply"
                    ? t("compose.submit.reply")
                    : isQuoteMode
                      ? t("compose.submit.quote")
                      : t("compose.submit.create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
