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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Text from "@/components/ui/text";
import type {
  NoteComposerDialogProps,
  RenoteDialogContext,
} from "@/features/compose-dialog/lib/note-composer-types";
import { ReplyTargetPreview } from "./ReplyTargetPreview";

export function RenoteDialogWrapper({
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

export function RenoteDialog({
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
