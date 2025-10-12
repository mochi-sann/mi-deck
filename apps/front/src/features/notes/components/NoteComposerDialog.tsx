import type { Note } from "misskey-js/entities.js";
import type { ReactNode } from "react";
import { cloneElement, isValidElement, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Text from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useNoteComposer } from "../hooks/useNoteComposer";
import { ReplyTargetPreview } from "./ReplyTargetPreview";

type NoteComposerMode = "create" | "reply";

interface NoteComposerDialogProps {
  mode: NoteComposerMode;
  trigger: ReactNode;
  disabled?: boolean;
  replyTarget?: Note;
  origin?: string;
  initialServerId?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onOpenChange?: (open: boolean) => void;
  showSuccessMessage?: boolean;
}

export function NoteComposerDialog({
  mode,
  trigger,
  disabled,
  replyTarget,
  origin,
  initialServerId,
  onSuccess,
  onError,
  onOpenChange,
  showSuccessMessage = true,
}: NoteComposerDialogProps) {
  const { t } = useTranslation("notes");
  const [open, setOpen] = useState(false);
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
    initialServerId,
    onSuccess: () => {
      setOpen(false);
      setSuccessMessage(
        mode === "reply"
          ? t("compose.success.reply")
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

  const handleDialogChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      resetState();
      clearSubmitError();
    }
  };

  const triggerNode = useMemo(() => {
    if (!isValidElement(trigger)) return trigger;
    return cloneElement(trigger, {
      disabled: disabled ?? trigger.props.disabled,
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
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
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
                    : t("compose.title.create")}
                </DialogTitle>
                <DialogDescription>
                  {mode === "reply"
                    ? t("compose.description.reply")
                    : t("compose.description.create")}
                </DialogDescription>
              </DialogHeader>

              {mode === "reply" && replyTarget ? (
                <ReplyTargetPreview note={replyTarget} origin={origin} />
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
                      <Text affects="xsmall" className="text-muted-foreground">
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
