import type { Note } from "misskey-js/entities.js";
import type { ReactElement, ReactNode } from "react";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { FileUpload } from "@/components/parts/FileUpload";
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
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Text from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { useNoteComposer } from "../hooks/useNoteComposer";
import { ReplyTargetPreview } from "./ReplyTargetPreview";

type NoteComposerMode = "create" | "reply" | "renote" | "quote";

interface RenoteDialogContext {
  isRenoted: boolean;
  isProcessing: boolean;
  isStorageLoading: boolean;
  serversWithToken: MisskeyServerConnection[];
  determineInitialServerId: () => string | undefined;
  toggleRenote: (serverSessionId: string) => Promise<void>;
}

interface NoteComposerDialogProps {
  mode: NoteComposerMode;
  trigger?: ReactNode;
  disabled?: boolean;
  replyTarget?: Note;
  quoteTarget?: Note;
  renoteTarget?: Note;
  origin?: string;
  initialServerId?: string;
  renoteContext?: RenoteDialogContext;
  open?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onOpenChange?: (open: boolean) => void;
  showSuccessMessage?: boolean;
}

function StandardNoteComposerDialog({
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

  useEffect(() => {
    if (!open) {
      resetState();
      clearSubmitError();
    }
  }, [open, resetState, clearSubmitError]);

  const visibilityOptions = useMemo(
    () => [
      { value: "public", label: t("compose.visibility.public") },
      { value: "home", label: t("compose.visibility.home") },
      { value: "followers", label: t("compose.visibility.followers") },
      { value: "specified", label: t("compose.visibility.specified") },
    ],
    [t],
  );

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
                name="serverSessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("compose.serverLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isLoadingServers || disabled}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isLoadingServers
                                ? t("compose.serverLoading")
                                : t("compose.serverPlaceholder")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serversWithToken.map((server) => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.origin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("compose.visibilityLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "public"}
                      disabled={disabled}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("compose.visibilityPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isLocalOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel>{t("compose.localOnlyLabel")}</FormLabel>
                      <Text affects="muted" className="text-muted-foreground">
                        {t("compose.localOnlyDescription")}
                      </Text>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noteContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("compose.contentLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t("compose.contentPlaceholder")}
                        minLength={0}
                        className="min-h-[120px]"
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FileUpload files={files} onFilesChange={setFiles} />

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

export function NoteComposerDialog(props: NoteComposerDialogProps) {
  if (props.mode === "renote") {
    return <RenoteDialogWrapper {...props} />;
  }

  return <StandardNoteComposerDialog {...props} />;
}

function RenoteDialogWrapper({
  trigger,
  disabled,
  replyTarget,
  quoteTarget,
  renoteTarget,
  origin,
  renoteContext,
  open: controlledOpen,
  onSuccess,
  onError,
  onOpenChange,
}: NoteComposerDialogProps) {
  const resolvedQuoteTarget = quoteTarget ?? replyTarget;
  const resolvedRenoteTarget =
    renoteTarget ?? resolvedQuoteTarget ?? replyTarget;
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

  return (
    <RenoteDialog
      trigger={trigger}
      disabled={disabled}
      targetNote={resolvedRenoteTarget}
      origin={origin}
      context={renoteContext}
      open={open}
      onSuccess={onSuccess}
      onError={onError}
      onOpenChange={emitOpenChange}
    />
  );
}

interface RenoteDialogProps {
  trigger?: ReactNode;
  disabled?: boolean;
  targetNote?: Note;
  origin?: string;
  context?: RenoteDialogContext;
  open?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onOpenChange?: (open: boolean) => void;
}

function RenoteDialog({
  trigger,
  disabled,
  targetNote,
  origin,
  context,
  open: controlledOpen,
  onSuccess,
  onError,
  onOpenChange,
}: RenoteDialogProps) {
  const { t } = useTranslation("timeline");
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(controlledOpen ?? false);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;

  const serversWithToken = context?.serversWithToken ?? [];
  const isStorageLoading = context?.isStorageLoading ?? false;
  const isProcessing = context?.isProcessing ?? false;
  const isRenoted = context?.isRenoted ?? false;

  useEffect(() => {
    if (!open) return;
    if (!context) return;
    const initial = context.determineInitialServerId();
    setSelectedServerId(initial ?? "");
    setSubmitError(null);
  }, [context, open]);

  useEffect(() => {
    if (isControlled) {
      setInternalOpen(controlledOpen ?? false);
    }
  }, [controlledOpen, isControlled]);

  const emitOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const handleDialogChange = (nextOpen: boolean) => {
    if (disabled && nextOpen) return;
    if (!nextOpen) {
      setSubmitError(null);
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

  const handleConfirm = useCallback(async () => {
    if (!context) {
      setSubmitError(t("renote.error.generic"));
      return;
    }

    if (!selectedServerId) {
      setSubmitError(t("renote.error.noServer"));
      return;
    }

    setSubmitError(null);

    try {
      await context.toggleRenote(selectedServerId);
      onSuccess?.();
      emitOpenChange(false);
    } catch (error) {
      setSubmitError(
        isRenoted
          ? t("renote.error.unrenoteFailed")
          : t("renote.error.renoteFailed"),
      );
      onError?.(error);
    }
  }, [
    context,
    emitOpenChange,
    isRenoted,
    onError,
    onSuccess,
    selectedServerId,
    t,
  ]);

  const hasServers = serversWithToken.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      {triggerNode ? (
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      ) : null}
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>
            {isRenoted
              ? t("renote.dialog.titleUndo")
              : t("renote.dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {isRenoted
              ? t("renote.dialog.descriptionUndo")
              : t("renote.dialog.description")}
          </DialogDescription>
        </DialogHeader>

        {targetNote ? (
          <ReplyTargetPreview note={targetNote} origin={origin} />
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="renote-server">
            {t("renote.dialog.serverLabel")}
          </Label>
          <Select
            value={selectedServerId}
            onValueChange={setSelectedServerId}
            disabled={!hasServers || isProcessing || isStorageLoading}
          >
            <SelectTrigger id="renote-server" className="w-full">
              <SelectValue
                placeholder={
                  isStorageLoading
                    ? t("renote.dialog.serverLoading")
                    : t("renote.dialog.serverPlaceholder")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {serversWithToken.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  {server.origin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasServers ? (
            <Text affects="small" className="text-muted-foreground">
              {t("renote.unavailable")}
            </Text>
          ) : null}
        </div>

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
            {t("renote.dialog.cancel")}
          </Button>
          <Button
            type="button"
            isLoading={isProcessing}
            disabled={!hasServers || isProcessing || !selectedServerId}
            onClick={handleConfirm}
          >
            {isRenoted
              ? t("renote.dialog.actionUndo")
              : t("renote.dialog.action")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
