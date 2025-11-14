import type { ReactElement } from "react";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { Check, Globe, ImagePlus, Server, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FileUpload } from "@/components/parts/FileUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { CustomEmojiPicker } from "@/features/timeline/components/CustomEmojiPicker";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import type { NoteComposerDialogProps } from "./note-composer-types";
import { useNoteComposer } from "../hooks/useNoteComposer";
import { ReplyTargetPreview } from "./ReplyTargetPreview";
import { ComposerFieldGroup } from "./ComposerFieldGroup";

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
      { value: "public", label: t("compose.visibility.public") },
      { value: "home", label: t("compose.visibility.home") },
      { value: "followers", label: t("compose.visibility.followers") },
      { value: "specified", label: t("compose.visibility.specified") },
    ],
    [t],
  );

  const serverSessionIdValue = form.watch("serverSessionId") ?? "";
  const visibilityValue = form.watch("visibility") ?? "public";
  const noteContentValue = form.watch("noteContent") ?? "";

  const selectedServer = useMemo(
    () =>
      serversWithToken.find((server) => server.id === serverSessionIdValue),
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
          currentValue.slice(0, start) +
          emojiText +
          currentValue.slice(end);
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

  const fieldIds = {
    server: {
      control: `${baseFieldId}-server-control`,
      description: `${baseFieldId}-server-description`,
      status: `${baseFieldId}-server-status`,
      error: `${baseFieldId}-server-error`,
    },
    visibility: {
      control: `${baseFieldId}-visibility-control`,
      description: `${baseFieldId}-visibility-description`,
      status: `${baseFieldId}-visibility-status`,
      error: `${baseFieldId}-visibility-error`,
    },
    localOnly: {
      control: `${baseFieldId}-local-control`,
      description: `${baseFieldId}-local-description`,
      status: `${baseFieldId}-local-status`,
      error: `${baseFieldId}-local-error`,
    },
    content: {
      control: `${baseFieldId}-content-control`,
      description: `${baseFieldId}-content-description`,
      status: `${baseFieldId}-content-status`,
      error: `${baseFieldId}-content-error`,
    },
    attachments: {
      control: `${baseFieldId}-attachments-control`,
      description: `${baseFieldId}-attachments-description`,
      status: `${baseFieldId}-attachments-status`,
      error: `${baseFieldId}-attachments-error`,
    },
  } as const;

  useEffect(() => {
    if (!open) {
      resetState();
      clearSubmitError();
      setIsEmojiPickerOpen(false);
      setIsServerPopoverOpen(false);
      setIsVisibilityPopoverOpen(false);
    }
  }, [
    open,
    resetState,
    clearSubmitError,
    setIsEmojiPickerOpen,
    setIsServerPopoverOpen,
    setIsVisibilityPopoverOpen,
  ]);

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
                  const describedBy = [
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
                          <span className="text-xs text-muted-foreground">
                            {t("compose.characterRemaining", {
                              count: Math.max(0, remainingCharacters),
                            })}
                          </span>
                          {serverError ? (
                            <span className="text-xs text-destructive">
                              {serverError}
                            </span>
                          ) : null}
                          {visibilityError ? (
                            <span className="text-xs text-destructive">
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
                        <div className="flex items-center gap-1.5">
                          <FormField
                            control={form.control}
                            name="serverSessionId"
                            render={({ field }) => (
                              <Popover
                                open={isServerPopoverOpen}
                                onOpenChange={setIsServerPopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <InputGroupButton
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label={serverButtonLabel}
                                    title={serverButtonLabel}
                                    disabled={
                                      formDisabled ||
                                      isLoadingServers ||
                                      serversWithToken.length === 0
                                    }
                                  >
                                    <Server className="size-4" />
                                  </InputGroupButton>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0" align="end">
                                  {serversWithToken.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">
                                      {t("compose.error.noServer")}
                                    </div>
                                  ) : (
                                    <div className="max-h-72 overflow-y-auto p-1">
                                      {serversWithToken.map((server) => {
                                        const isActive = server.id === field.value;
                                        return (
                                          <button
                                            key={server.id}
                                            type="button"
                                            className={cn(
                                              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                              isActive
                                                ? "bg-muted"
                                                : "hover:bg-muted/80",
                                            )}
                                            onClick={() => {
                                              field.onChange(server.id);
                                              setIsServerPopoverOpen(false);
                                            }}
                                          >
                                            <Avatar className="h-8 w-8">
                                              {server.userInfo?.avatarUrl ? (
                                                <AvatarImage
                                                  src={server.userInfo.avatarUrl}
                                                  alt={getServerDisplayName(server)}
                                                />
                                              ) : (
                                                <AvatarFallback>
                                                  {getServerDisplayName(server)
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                                </AvatarFallback>
                                              )}
                                            </Avatar>
                                            <div className="flex flex-col text-left">
                                              <span className="font-medium">
                                                {getServerDisplayName(server)}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {getServerSubtitle(server)}
                                              </span>
                                            </div>
                                            <Check
                                              className={cn(
                                                "ml-auto size-4 text-primary",
                                                isActive ? "opacity-100" : "opacity-0",
                                              )}
                                            />
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </PopoverContent>
                              </Popover>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                              <Popover
                                open={isVisibilityPopoverOpen}
                                onOpenChange={setIsVisibilityPopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <InputGroupButton
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label={visibilityButtonLabel}
                                    title={visibilityButtonLabel}
                                    disabled={formDisabled}
                                  >
                                    <Globe className="size-4" />
                                  </InputGroupButton>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0" align="end">
                                  <div className="p-1">
                                    {visibilityOptions.map((option) => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        className={cn(
                                          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                          option.value === field.value
                                            ? "bg-muted"
                                            : "hover:bg-muted/80",
                                        )}
                                        onClick={() => {
                                          field.onChange(option.value);
                                          setIsVisibilityPopoverOpen(false);
                                        }}
                                      >
                                        <span>{option.label}</span>
                                        <Check
                                          className={cn(
                                            "ml-auto size-4 text-primary",
                                            option.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          />
                          <Popover
                            open={isEmojiPickerOpen}
                            onOpenChange={setIsEmojiPickerOpen}
                          >
                            <PopoverTrigger asChild>
                              <InputGroupButton
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={!selectedServer || formDisabled}
                                aria-label={t("compose.emojiInsert")}
                                title={t("compose.emojiInsert")}
                              >
                                <Smile className="size-4" />
                              </InputGroupButton>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              sideOffset={8}
                              className="w-80 p-0"
                            >
                              {selectedServer ? (
                                <CustomEmojiPicker
                                  origin={emojiOrigin}
                                  onEmojiSelect={handleEmojiSelect}
                                />
                              ) : (
                                <div className="p-4 text-sm text-muted-foreground">
                                  {t("compose.emojiPickerPlaceholder")}
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                          <InputGroupButton
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("compose.attachmentsLabel")}
                            title={t("compose.attachmentsLabel")}
                            disabled={formDisabled}
                            onClick={openFileSelector}
                          >
                            <ImagePlus className="size-4" />
                          </InputGroupButton>
                        </div>
                      }
                    >
                      <div className="flex flex-col gap-3">
                        <FormField
                          control={form.control}
                          name="isLocalOnly"
                          render={({ field: localField }) => (
                            <FormItem className="flex flex-row items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  id={fieldIds.localOnly.control}
                                  checked={localField.value}
                                  onCheckedChange={localField.onChange}
                                  disabled={disabled}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={fieldIds.localOnly.control}
                                className="text-sm text-muted-foreground"
                              >
                                {t("compose.localOnlyDescription")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormControl>
                          <InputGroupTextarea
                            {...field}
                            id={fieldIds.content.control}
                            aria-describedby={describedBy}
                            placeholder={t("compose.contentPlaceholder")}
                            minLength={0}
                            className="min-h-[140px]"
                            disabled={disabled}
                            ref={(element) => {
                              field.ref(element);
                              noteTextareaRef.current = element;
                            }}
                          />
                        </FormControl>
                      </div>
                    </ComposerFieldGroup>
                  );
                }}
              />

              <ComposerFieldGroup
                label={t("compose.attachmentsLabel")}
                labelFor={fieldIds.attachments.control}
                description={attachmentsDescription}
                descriptionId={fieldIds.attachments.description}
                status={
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <ImagePlus className="mr-1 size-3.5" />
                      {files.length}
                    </Badge>
                    <span>{fileStatusText}</span>
                  </div>
                }
                statusId={fieldIds.attachments.status}
                disabled={formDisabled}
              >
                <FormControl>
                  <FileUpload
                    files={files}
                    onFilesChange={setFiles}
                    hideLabel
                    id={fieldIds.attachments.control}
                    disabled={formDisabled}
                    inputProps={{
                      "aria-describedby": [
                        fieldIds.attachments.description,
                        fieldIds.attachments.status,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined,
                    }}
                    inputRef={(element) => {
                      fileInputRef.current = element;
                    }}
                  />
                </FormControl>
              </ComposerFieldGroup>

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
